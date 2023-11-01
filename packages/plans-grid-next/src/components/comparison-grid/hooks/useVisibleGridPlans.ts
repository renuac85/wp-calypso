import { PlanSlug, comparePlans, isFreePlan } from '@automattic/calypso-products';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePlansGridContext } from '../../../grid-context';
import { GridPlan } from '../../../types';

/**
 *When plan changes occur, the visible plan order may need to be updated to reflect the new plans.
 *we must detect this prop change and transform the current visible plan order into a set of plans
 *that align with the currently selected plan interval without causing glitches or flashes.
 *
 *This hook serves as the solution. The hook accomplishes two main tasks:
 *- Resolves the correct visible plan order, providing it immediately in the current render cycle to prevent glitches.
 *- Updates the local state with the most up-to-date plan order as required.
 * @returns The list of gridPlans in the accurate display configuration.
 */
function useVisibleGridPlans(): [ GridPlan[], ( visibleGridPlans: PlanSlug[] ) => void ] {
	const { gridPlansIndex, gridPlans } = usePlansGridContext();
	const [ visibleGridPlanState, setVisibleGridPlans ] = useState< GridPlan[] >( gridPlans );

	const refreshedVisibleGridPlans: GridPlan[] = useMemo( () => {
		let newPlans: GridPlan[] = visibleGridPlanState;

		/**
		 * If at least one planSlug in the visibleGridPlanState state is not present in the current gridPlansIndex,
		 * it indicates that the visibleGridPlanState is now stale most probably due to a change in the interval.
		 */
		const isVisibleGridPlansStale = visibleGridPlanState.some(
			( plan ) => ! gridPlansIndex[ plan.planSlug ]
		);
		if ( isVisibleGridPlansStale ) {
			newPlans = visibleGridPlanState.map( ( previousPlan: GridPlan ) => {
				const { planSlug: previousPlanSlug } = previousPlan;
				if ( isFreePlan( previousPlanSlug ) ) {
					return previousPlan;
				}
				const foundPlan = gridPlans.find( ( newPlan ) =>
					comparePlans( previousPlanSlug, newPlan.planSlug, [ 'type' ] )
				);
				return foundPlan ?? previousPlan;
			} );
		}
		return newPlans;
	}, [ gridPlans, gridPlansIndex, visibleGridPlanState ] );

	const isVisibleGridPlansStale = refreshedVisibleGridPlans.length > 0;
	useEffect( () => {
		if ( isVisibleGridPlansStale ) {
			setVisibleGridPlans( refreshedVisibleGridPlans );
		}
	}, [ isVisibleGridPlansStale, refreshedVisibleGridPlans ] );

	const setVisibleGridPlansDisplay = useCallback(
		( planSlugs: PlanSlug[] ) => {
			setVisibleGridPlans( planSlugs.map( ( planSlug ) => gridPlansIndex[ planSlug ] ) );
		},
		[ gridPlansIndex, setVisibleGridPlans ]
	);

	let returnedVisibleGridPlans = visibleGridPlanState;
	if ( isVisibleGridPlansStale ) {
		returnedVisibleGridPlans = refreshedVisibleGridPlans;
	}

	return [ returnedVisibleGridPlans, setVisibleGridPlansDisplay ];
}

export default useVisibleGridPlans;
