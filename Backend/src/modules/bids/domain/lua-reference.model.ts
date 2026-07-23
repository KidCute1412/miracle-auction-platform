export interface LuaReferenceBidState {
  currentPriceVnd: bigint;
  stepPriceVnd: bigint;
  leaderId: number | null;
  leaderMaxPriceVnd: bigint | null;
}

export interface LuaReferenceBidDecision {
  currentPriceVnd: bigint;
  leaderId: number;
  leaderMaxPriceVnd: bigint;
}

const minimum = (left: bigint, right: bigint): bigint => left < right ? left : right;

export function decideLuaReferenceBid(
  state: LuaReferenceBidState,
  bidderId: number,
  maximumVnd: bigint,
): LuaReferenceBidDecision {
  if (maximumVnd < state.currentPriceVnd + state.stepPriceVnd) {
    throw new Error("BID_TOO_LOW");
  }
  if (state.leaderId === null || state.leaderMaxPriceVnd === null) {
    return { currentPriceVnd: state.currentPriceVnd, leaderId: bidderId, leaderMaxPriceVnd: maximumVnd };
  }
  if (state.leaderId === bidderId) {
    if (maximumVnd <= state.leaderMaxPriceVnd) throw new Error("MAXIMUM_NOT_INCREASED");
    return { currentPriceVnd: state.currentPriceVnd, leaderId: bidderId, leaderMaxPriceVnd: maximumVnd };
  }
  if (maximumVnd <= state.leaderMaxPriceVnd) {
    return {
      currentPriceVnd: minimum(maximumVnd + state.stepPriceVnd, state.leaderMaxPriceVnd),
      leaderId: state.leaderId,
      leaderMaxPriceVnd: state.leaderMaxPriceVnd,
    };
  }
  return {
    currentPriceVnd: minimum(state.leaderMaxPriceVnd + state.stepPriceVnd, maximumVnd),
    leaderId: bidderId,
    leaderMaxPriceVnd: maximumVnd,
  };
}
