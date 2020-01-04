import sendRequest from './sendRequest';

const BASE_PATH = '/api/v1/auth';

export const signUpLocal = ({ email, password, firstName, lastName }) =>
  sendRequest(
    `${BASE_PATH}/signUpLocal`,
    Object.assign({
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    }),
  );

export const loginLocal = ({ email, password, rememberMe, rememberMeToken }) =>
  sendRequest(`${BASE_PATH}/loginLocal`, {
    method: 'POST',
    body: JSON.stringify({ email, password, rememberMe, rememberMeToken }),
  });

export const googleSignIn = ({ googleToken }) =>
  sendRequest(`${BASE_PATH}/googleApi`, { googleToken });

export const logout = () =>
  sendRequest(
    `${BASE_PATH}/logout`,
    Object.assign({
      method: 'GET',
    }),
  );

export const findEmailByToken = ({ rememberMeToken }) =>
  sendRequest(
    `${BASE_PATH}/findEmailByToken`,
    Object.assign({
      method: 'POST',
      body: JSON.stringify({ rememberMeToken }),
    }),
  );