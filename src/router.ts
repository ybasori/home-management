import { createWebHistory, createRouter } from "vue-router";
import Home from "src/pages/Home/Home.vue";
import Activity from "src/pages/Activity/Activity.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "",
      path: "/",
      children: [
        { name: "Home", path: "", component: Home },
        { name: "Activity", path: "activity", component: Activity },
      ],
    },
    // { name: "Login", path: "/login", component: Login },
    // { name: "404", path: "/:pathMatch(.*)*", component: Error404 },
  ],
});

// router.beforeEach((to, _from, next) => {
//   const isProtected =
//     routes.findIndex((item) => item.name === to.name && item.protected) >= 0;

//   const userStore = useUserLoggedIn();

//   if (isProtected && userStore.user !== null) next();
//   else if (to.name === "Login" && userStore.user !== null)
//     next({ name: "Home" });
//   else if (!isProtected) next();
//   else next({ name: "Login" });
// });

export default router;
