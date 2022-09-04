// This is a template file for store showing default structure of the document
// This is a namespaced store module, that means it can be added to a root index.js store as a module (see ./index.js)
// 

// Imports of requried scripts
//import { SecKyInstance } from '../lib/SecKy';
//import { debug } from '../lib/debug';

// Function, creating default state. Incapsulated to be reused by mutation reset
const createDefaultState = () => ({
  data: {
    id: 0
  }
})

// Store module
export default {
  // When created, state is assigned by cuntion createDefaultState
  // State fields are reactive, but should be treated with care
  state: createDefaultState(),
  // Getters allow to take current state object fields lazily
  getters: {
    id(state) {
      return state.data.id;
    }
  },
  // Actions are a real world high-level actions, handling data and applying patches to a state using mutations.
  // Actions cannot directly change state. It's bad practice.
  // Actions can be async. Basically they are all async.
  // Action receives store object as first arg and can use whatever required inside (like now only commit method is requested)
  // Second argument - all other arguments packed as object.
  actions: {
    updateId({ commit }, { newId }) {
      commit('mSet', { id: newId })
    }
  },
  // Mutations are syncronous functions, executed on the state directly. Usually executed by actions via commits
  // Mutation usually receive current state as 1st arg and some data as second optional one. 
  mutations: {
    mReset(state) {
      Object.assign(state, createDefaultState());
    },
    mSet(state, data) {
      state.data.id = data.id
    }
  },
}