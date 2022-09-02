import { SecKyInstance } from '../lib/SecKy';
import { debug }  from '../lib/debug';

const createDefaultState = () => ({
  data: {
    userName: undefined,
    email: undefined,
    claims: [],
    isLoggedIn: false,
  }
})

function parseClaims(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return Object.entries(JSON.parse(jsonPayload)).map((x) => ({ key: x[0], value: x[1] })) ?? [];
}

export default {
  state: createDefaultState(), 
  getters: {
    token(state) {
      return state.token;
    },
    refreshToken(state) {
      return state.refreshToken;
    }
  },
  actions: {
    async tryLogin({ commit }, { userName, password }) {
      let response = await SecKyInstance.post('/auth/login', {
        userName,
        password,
      });

      if (!response.success) {
        debug.error(`Error logging in user ${userName}. StatusCode: ${response.status}, Message: ${response.error}`);

        return false;
      }

      SecKyInstance.token = response.payload.token;
      SecKyInstance.refreshToken = response.payload.refreshToken;

      commit('setUserInfo', response.payload);

      return true;
    },
    async refresh({ commit, getters }) {
      let response = await SecKyInstance.post('/auth/refresh', {
        token: getters.token,
        refreshToken: getters.refreshToken
      });

      if (!response.success) {
        debug.error(`Error refreshing token. StatusCode: ${response.status}, Message: ${response.error}`);
        return;
      }

      SecKyInstance.token = response.payload.token;
      SecKyInstance.refreshToken = response.payload.refreshToken;

      commit('setUserInfo', response.payload);
    }
  },
  mutations: {
    reset(state) {
      state = createDefaultState();
    },
    setUserInfo(state, payload) {
      state.data.isLoggedIn = true;

      state.claims = parseClaims(payload.token);
      state.userName = state.claims.find(x => x.key == "name")?.value;
      state.email = state.claims.find(x => x.key == "email")?.value;
      state.role = state.claims.find(x => x.key == "role")?.value;
      state.token = payload.token;
      state.refreshToken = payload.refreshToken;
    },
  },
}