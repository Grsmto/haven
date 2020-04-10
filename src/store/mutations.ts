import {
  HavenOptions,
  MutationsObject,
  Purpose,
  State,
  ConsentStatus,
} from '../types';

const mutations: MutationsObject<State> = {
  /**
   * Set the initial application state.
   * @param state
   * @param options
   */
  SET_INITIAL_STATE(state, options: HavenOptions) {
    return {
      ...state,
      ...options,
    };
  },

  /**
   * Set all consent values.
   * @param state
   * @param consents
   */
  SET_CONSENTS(state, consents: ConsentStatus) {
    state.consent = consents;
    return state;
  },

  /**
   * Set consent status for a given purpose.
   * @param state
   * @param purpose
   * @param status
   */
  SET_CONSENT(
    state,
    { purpose, status }: { purpose: Purpose; status: boolean }
  ) {
    state.consent[purpose] = status;
    return state;
  },

  /**
   * Set service (by name) as injected.
   * @param state
   * @param service
   */
  SET_INJECTED(state, service: string) {
    state.injected[service] = true;
    return state;
  },
};

export default mutations;
