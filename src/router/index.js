import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../layouts/admin.vue"),
    redirect: "/login",
    children: [
      {
        path: "/",
        name: "dashboard",
        component: () => import("../pages/dashboard.vue"),
      },
      {
        path: "/users",
        name: "users",
        component: () => import("../pages/users/user-list.vue"),
      },
      {
        path: "/create-user",
        name: "create-user",
        component: () => import("../pages/users/create-user.vue"),
      },
      {
        path: "/edit-user/:id",
        name: "edit-user",
        component: () => import("../pages/users/edit-user.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("../layouts/auth.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("../pages/auth/SignIn.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  redirect: "/login",
  routes,
});

router.beforeEach((to, from) => {
  const isLoggedin = localStorage.getItem("user");

  if (!isLoggedin && to.name != "login") {
    return { name: "login" };
  }
});

export default router;
