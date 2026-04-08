import CommonRouterPath from '~/enums/common-router-path';

export default defineNuxtRouteMiddleware(async (to) => {
  const authenticationStore = useAuthenticationStore();
  const userInfoStore = useUserInfoStore();

  if (!authenticationStore.isLoggedIn) {
    return navigateTo({
      path: CommonRouterPath.LOGIN,
      query: {
        redirect: encodeURIComponent(to.fullPath),
      },
    });
  }

  if (!userInfoStore.isFetched) {
    const loaded = await userInfoStore.fetchUserInfo();

    if (!loaded) {
      await authenticationStore.clearAuthentication();
      return navigateTo({
        path: CommonRouterPath.LOGIN,
        query: {
          redirect: encodeURIComponent(to.fullPath),
        },
      });
    }
  }

  if (!userInfoStore.isAdmin) {
    return navigateTo(CommonRouterPath.HOME);
  }
});
