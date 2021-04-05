import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)
const Login = () => import("../views/Login.vue")
const Home = () => import("../views/Home.vue")

const routes = [
  {
    path:'',
    redirect:'/login'
  },
  {
    path: "/login",
    component: Login
  },
  {
    path: "/home",
    component: Home
  }
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})
router.beforeEach((to,from,next) => {
  if(to.path == '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if(!token) return next('/login')
  next()
})

export default router
