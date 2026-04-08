import CommonRouterPathName from '~/enums/common-router-path-name';
import CommonRouterPath from '~/enums/common-router-path';
import config from '~/config';

export default defineNuxtRouteMiddleware(async (to) => {
  const authenticationStore = useAuthenticationStore();
  const userInfoStore = useUserInfoStore();

  if (to.name === CommonRouterPathName.LOGIN && authenticationStore.isLoggedIn) {
    return navigateTo({
      path: CommonRouterPath.HOME,
      replace: true,
    });
  }

  if (config.anonymousEnable) {
    return await handleAnonymousMode(authenticationStore, userInfoStore);
  }

  if (
    config.ignoreAuthenticationRoutes.includes(to.name as CommonRouterPathName)
    || to.meta.ignoreAuthentication
  ) {
    return;
  }

  if (!authenticationStore.isLoggedIn) {
    const query: Recordable<string> = {};

    if (
      ![
        CommonRouterPathName.NOT_FOUND,
        CommonRouterPathName.FORBIDDEN,
        CommonRouterPathName.HOME,
      ].includes(to.name as CommonRouterPathName)
    ) {
      query.redirect = to.fullPath;
    }

    return navigateTo({
      name: CommonRouterPathName.LOGIN,
      query,
      replace: true,
    });
  }

  if (!userInfoStore.isFetched) {
    const loaded = await userInfoStore.fetchUserInfo();

    if (!loaded) {
      await authenticationStore.clearAuthentication();
      return navigateTo({
        name: CommonRouterPathName.LOGIN,
        replace: true,
      });
    }
  }
});

/**
 * 处理匿名模式
 */
async function handleAnonymousMode(
  authenticationStore: ReturnType<typeof useAuthenticationStore>,
  userInfoStore: ReturnType<typeof useUserInfoStore>,
) {
  if (!userInfoStore.isFetched) {
    if (authenticationStore.isLoggedIn) {
      const loaded = await userInfoStore.fetchUserInfo();

      if (!loaded) {
        await authenticationStore.clearAuthentication();
        return navigateTo({
          name: CommonRouterPathName.LOGIN,
          replace: true,
        });
      }

      return;
    }

    await authenticationStore.buildAnonymousToken();
    return;
  }

  if (authenticationStore.isLoggedIn && userInfoStore.isAnonymousUser) {
    const loaded = await userInfoStore.fetchUserInfo();

    if (!loaded) {
      await authenticationStore.clearAuthentication();
      return navigateTo({
        name: CommonRouterPathName.LOGIN,
        replace: true,
      });
    }
  }
}
