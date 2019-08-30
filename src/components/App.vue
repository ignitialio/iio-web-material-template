<template>
  <v-app class="app-layout"
    :class="{ 'login': $router.currentRoute.name === 'Sign in' }"
    :dark="$store.state.ui.darkTheme">

    <div>
      <!-- MOBILE SCREEN -->
      <v-app-bar dense class="d-block d-sm-none"
        :flat="$store.state.ui.flatToolbar"
        :color="$store.state.ui.toolbarColor">

        <v-app-bar-nav-icon
          v-if="$router.currentRoute.name !== 'Sign in'"
          @click="leftSidenav = !leftSidenav">
          <v-img max-width="32" aspect-ratio="1"
            class="app-logo" src="assets/ignitialio-32.png"></v-img>
        </v-app-bar-nav-icon>

        <v-toolbar-title style="margin-left: -16px">
          <span style="color: deepskyblue">I<span style="color: tomato">G</span>NITIAL</span>
        </v-toolbar-title>

        <div class="app-ctx flex-grow-1">
          <!-- Show where we are - app section -->
          <component v-if="contextComponent" :is="contextComponent"></component>
        </div>

        <div v-if="user" class="ig-clickable app-avatar-small"
          @click="showNotifications = !showNotifications">
          <v-badge overlap color="rgba(205, 133, 63, 0.8)">
            <span slot="badge" v-if="userNotifications.length > 0">
              {{ userNotifications ? userNotifications.length : 0 }}</span>

            <v-avatar :size="32" style="border: 1px solid slategrey!important;">
              <img :src="user ? $utils.fileUrl(user.picture.thumbnail) :
                'assets/icons/user.png'" alt=""/>
            </v-avatar>
         </v-badge>
        </div>

        <div v-if="!user && $router.currentRoute.name !== 'Sign in'">
          <v-btn icon color="green" @click.stop="$router.push('/login')">
            <v-icon>open_in_browser</v-icon>
          </v-btn>
        </div>

        <v-progress-circular v-show="!offline && !connected && user"
          indeterminate :size="20" :width="1" color="primary">
        </v-progress-circular>

        <v-icon v-show="offline && !connected && user"
          color="red">cloud_off</v-icon>
      </v-app-bar>

      <!-- DESKTOP SCREEN -->
      <v-app-bar app dense
        class="app-bar d-none d-sm-block d-md-block d-lg-block d-xl-block"
        :flat="$store.state.ui.flatToolbar"
        :color="$store.state.ui.toolbarColor">

        <v-img v-if="$router.currentRoute.name !== 'Sign in'"
          max-width="32" aspect-ratio="1"
          class="app-logo" src="assets/ignitialio-32.png"></v-img>

        <v-toolbar-title style="margin-left: 16px">
          <span style="color: deepskyblue">I<span style="color: tomato">G</span>NITIAL</span>
        </v-toolbar-title>

        <div class="app-ctx">
          <!-- Show where we are - app section -->
          <component v-if="contextComponent" :is="contextComponent"></component>
        </div>

        <div class="flex-grow-1"></div>

        <div v-if="$router.currentRoute.name !== 'Sign in'" class="app-menu">
          <div v-for="item in topMenu" @click.stop="handleMenuItem(item)"
            class="app-menu-item"
            :class="{ 'selected': selectedMenu === item.title }">
            {{ $t(item.title) }}
          </div>
        </div>

        <div v-if="user" class="ig-clickable app-avatar-small"
          @click="showNotifications = !showNotifications">
          <v-badge overlap color="rgba(205, 133, 63, 0.8)">
            <span slot="badge" v-if="userNotifications.length > 0">
              {{ userNotifications ? userNotifications.length : 0 }}</span>

            <v-avatar :size="32" style="border: 1px solid slategrey!important;">
              <img :src="user ? $utils.fileUrl(user.picture.thumbnail) :
                'assets/icons/user.png'" alt=""/>
            </v-avatar>
         </v-badge>
        </div>

        <div v-if="!user && $router.currentRoute.name !== 'Sign in'">
          <v-btn icon color="green darken-2" @click.stop="$router.push('/login')">
            <v-icon>open_in_browser</v-icon>
          </v-btn>
        </div>

        <v-progress-circular v-show="!offline && !connected && user"
          indeterminate :size="20" :width="1" color="primary">
        </v-progress-circular>

        <v-icon v-show="offline && !connected && user"
          color="red">cloud_off</v-icon>
      </v-app-bar>
    </div>

    <v-navigation-drawer app dark
      :mini-variant.sync="mini"
      temporary
      ref="leftSideNav" v-model="leftSidenav">

      <v-list-item>
        <v-list-item-avatar>
          <v-img v-if="user" :src="user && user.picture && user.picture.thumbnail ?
            $utils.fileUrl(user.picture.thumbnail) :
            'assets/icons/user.png'" alt=""></v-img>

          <v-img v-if="!user" class="app-logo" src="assets/ignitialio-32.png"></v-img>
        </v-list-item-avatar>

        <v-list-item-title
          @click="$router.push('/profile')">
          <span v-if="user">{{ $t(user.name.first + ' ' + user.name.last) }}</span>
          <v-icon v-if="user && user.role === 'admin'" color="orange">star_border</v-icon>
        </v-list-item-title>

        <v-btn icon @click.stop="mini = !mini">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <template v-for="(item, index) in $store.state.menuItems">
          <div style="display: none" :key="index">{{ index }}</div> <!-- lint -->
          <v-divider v-if="item.divider && (item.anonymousAccess || !!user)"
            :inset="item.inset" :key="item.inset"></v-divider>
          <v-subheader
            v-if="!mini && item && item.header && (item.anonymousAccess || !!user)"
            :key="item.header">
            {{ $t(item.header) }}</v-subheader>
          <v-list-item :key="item.title"
            v-if="item.title && !item.hidden &&
              (item.anonymousAccess || (!!user && !item.hideIfLogged))"
            @click="item.event ? $service.emit(item.event) :
              $router.push(item.route.path)">
              <v-list-item-action class="app-menu-item-icon">
                <v-icon v-if="!item.svgIcon">{{ item.icon }}</v-icon>
                <img v-if="item.svgIcon" class="ig-menu-icon" :src="item.svgIcon" alt=""/>
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title
                  :class="{ 'app-menu-item-selected':
                    $store.state.route.path === item.path }">
                  {{ $t(item.title) }}</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>

      <v-list v-if="!mini" dense>
        <v-divider></v-divider>
        <v-subheader>{{ $t('Credits') }}</v-subheader>

        <v-list-item>
          <v-list-item-action>
            <v-img max-width="48" max-height="48" aspect-ratio="1"
              src="assets/logo-ignitial.png" alt=""></v-img>
          </v-list-item-action>
          <v-list-item-content>
            <span style="color: deepskyblue">I<span style="color: tomato">g</span>nitial <span style="color: gainsboro"> &copy;{{ new Date().getFullYear() }}</span></span>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-content class="app-view">
      <transition name="fade">
        <router-view class="app-router"></router-view>
      </transition>

      <v-snackbar v-model="notificationSnack"
        :timeout="5000">
        {{ notification }}
      </v-snackbar>

      <!-- Confirm dialog -->
      <v-dialog v-model="confirmDialog" max-width="500px"
        @close="handleConfirmClose">
        <v-card>
          <v-card-title>
            <div v-if="confirmationPrompt !== null">
              {{ confirmationPrompt }}
            </div>
          </v-card-title>

          <v-card-text>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" flat
              @click="handleConfirm('ok')">
              {{ $t('Apply') }}
            </v-btn>

            <v-btn color="error" flat
              @click="handleConfirm('cancel')">
              {{ $t('Cancel') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-bottom-sheet v-model="showNotifications">
        <v-list>
          <v-subheader>{{ $t('Notifications') }}</v-subheader>
          <v-list-item
            v-for="notification in userNotifications" :key="notification._id"
            @click="ackNotification(notification)">

            <v-list-item-avatar>
              <img :src="notification.image" alt=""/>
            </v-list-item-avatar>

            <v-list-item-title>
              <span>{{ notification.message }}</span>
              <span class="app-notification-date">
                {{ $utils.fromNow(notification._lastModified) }}</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-bottom-sheet>
    </v-content>
  </v-app>
</template>

<script>
import _ from 'lodash'
import LoginView from '../views/LoginView.vue'
import MainView from '../views/MainView.vue'
import UsersView from '../views/UsersView.vue'
import ListView from '../views/ListView.vue'
import ItemView from '../views/ItemView.vue'
import ProductsView from '../views/ProductsView.vue'
import ServicesView from '../views/ServicesView.vue'
import BlogView from '../views/BlogView.vue'
import ContactView from '../views/ContactView.vue'
import SignUpView from '../views/SignUpView.vue'
import ArticleView from '../views/ArticleView.vue'

import MyItemsView from '../views/MyItemsView.vue'

import UsersContextBar from '../views/context/UsersContextBar.vue'
import ListContextBar from '../views/context/ListContextBar.vue'
import ItemContextBar from '../views/context/ItemContextBar.vue'
import MyItemsContextBar from '../views/context/MyItemsContextBar.vue'

export default {
  data: () => {
    return {
      mini: true,
      showMenu: false,
      showProgressBar: false,
      notification: null,
      contextComponent: null,
      progress: 50,
      notification: '',
      userNotifications: [],
      lastNotification: null,
      showNotifications: false,
      leftSidenav: false,
      notificationSnack: false,
      confirmDialog: false,
      confirmationPrompt: null,
      selectedMenu: null,
      topMenu: []
    }
  },
  computed: {
    offline() {
      return this.$config.offline ? this.$config.offline.activated : false
    },
    user() {
      return this.$store.state.user
    },
    connected() {
      return this.$store.state.connected
    }
  },
  components: {
    'users-ctx': UsersContextBar,
    'list-ctx': ListContextBar,
    'item-ctx': ItemContextBar,
    'myitems-ctx': MyItemsContextBar
  },
  methods: {
    /*
      Shows Snack (app) notification (used from any where with this.$root)
    */
    showAppNotification(msg) {
      this.notification = msg
      this.notificationSnack = true
    },
    handleConfirmClose() {
      this.$services.emit('app:confirmation:response', 'cancel')
    },
    handleConfirm(what) {
      if (this.confirmDialog) {
        this.confirmDialog = false

        this.$services.emit('app:confirmation:response', what)
      }
    },
    handleMenuItem(item) {
      console.log('menu', item.title)
      this.selectedMenu = item.title
      this.$router.push(item.route.path)
    },
    handleMenuItemsAdd(items) {
      let routes = []
      let menuItems = this.$store.state.menuItems

      for (let item of items) {
        let idx = _.findIndex(menuItems, e => e.title === item.title)

        if (idx === -1) {
          item.selected = false
          menuItems.push(item)

          if (item.route) {
            if (!item.anonymousAccess) {
              item.route.beforeEnter = (to, from, next) => {
                let token = localStorage.getItem('token')

                if (token && token !== null) {
                  next()
                } else {
                  next({ path: '/login' })
                }
              }
            }

            routes.push(item.route)

            if (this.$router.currentRoute.path === item.route.path) {
              this.selectedMenu = item.title
            }
          }
        }
      }

      menuItems = _.sortBy(menuItems, 'index')
      this.$store.commit('menuItems', menuItems)

      this.topMenu = menuItems.slice(0, 5)

      if (routes.length > 0) {
        this.$router.addRoutes(routes)
        console.log('routes added', _.map(routes, e => e.path))
      }
    },
    handleMenuItemsRemove(items) {
      let menuItems = this.$store.state.menuItems

      for (let item of items) {
        let idx = _.findIndex(menuItems, e => e.path === item.path)

        if (idx) {
          this.menuItems.splice(idx, 1)
        }
      }

      this.$store.commit('menuItems', menuItems)
    },
    handleNotification(data) {
      console.log('notification', data)
    },
    checkIfAdminRole() {
      this.$utils.waitForProperty(this.$store.state, 'user').then(user => {
        this.$services.waitForService(this.$config.auth.service).then(auth => {
          auth.role(user.login.username).then(role => {
            user.role = role
            this.$store.commit('user', user)
          }).catch(err => console.log('failed to get user\'s role'))
        })
      }).catch(err => console.log('not connected user'))
    }
  },
  mounted() {
    // reset menu
    this.$store.commit('menuItems', [])

    // menu items registering
    this.$services.on('app:menu:add', this.handleMenuItemsAdd)
    this.$services.on('app:menu:remove', this.handleMenuItemsRemove)

    // base menu
    this.$services.emit('app:menu:add', [
      {
        index: 0,
        title: 'Home',
        icon: 'home',
        anonymousAccess: true,
        route: {
          name: 'Home',
          path: '/',
          component: MainView
        },
        selected: false
      },
      {
        index: 1,
        title: 'Products',
        icon: 'devices',
        anonymousAccess: true,
        route: {
          name: 'Products',
          path: '/products',
          component: ProductsView
        },
        selected: false
      },
      {
        index: 2,
        title: 'Services',
        icon: 'business',
        anonymousAccess: true,
        route: {
          name: 'Services',
          path: '/services',
          component: ServicesView
        },
        selected: false
      },
      {
        index: 3,
        title: 'Blog',
        icon: 'toys',
        anonymousAccess: true,
        route: {
          name: 'Blog',
          path: '/blog',
          component: BlogView
        },
        selected: false
      },
      {
        index: 4,
        title: 'Contact',
        icon: 'supervisor_account',
        anonymousAccess: true,
        route: {
          name: 'Contact',
          path: '/contact',
          component: ContactView
        },
        selected: false
      },
      {
        index: 10,
        divider: true,
        anonymousAccess: false,
        /* Test section */
        header: 'Test'
      },
      {
        index: 11,
        /* List route, no menu */
        title: 'List view',
        icon: 'list',
        hidden: true, /* do not show it in the menu */
        anonymousAccess: false,
        route: {
          path: '/list',
          component: ListView
        },
        selected: false
      },
      {
        index: 12,
        /* Item route, no menu */
        title: 'Item view',
        icon: 'view_column',
        hidden: true, /* do not show it in the menu */
        anonymousAccess: false,
        route: {
          path: '/item',
          component: ItemView
        },
        selected: false
      },
      {
        index: 13,
        title: 'My items test',
        icon: 'explore',
        anonymousAccess: false,
        route: {
          name: 'My items',
          path: '/myitems',
          component: MyItemsView
        },
        selected: false
      },
      {
        index: 14,
        title: 'Article',
        icon: 'explore',
        anonymousAccess: true,
        hidden: true, /* do not show it in the menu */
        route: {
          name: 'Article',
          path: '/article',
          component: ArticleView
        },
        selected: false
      },
      {
        index: 20,
        divider: true,
        /* User management section */
        header: 'User management',
        anonymousAccess: false
      },
      {
        index: 21,
        title: 'Sign out',
        icon: 'lock_open',
        anonymousAccess: false,
        event: 'app:signout',
        selected: false
      },
      {
        index: 100,
        title: 'Sign in',
        icon: 'open_in_browser',
        anonymousAccess: true,
        hideIfLogged: true,
        route: {
          name: 'Sign in',
          path: '/login',
          component: LoginView
        },
        selected: false
      },
      {
        index: 101,
        title: 'Sign up',
        icon: 'person_pin',
        anonymousAccess: true,
        hideIfLogged: true,
        route: {
          name: 'Sign up',
          path: '/signup',
          component: SignUpView
        },
        selected: false
      }
    ])

    // update router with redirection
    this.$router.addRoutes([
      {
        path: '*',
        redirect: '/'
      }
    ])

    // app sign in event
    this.$services.on('app:signin', info => {
      this.$store.commit('user', info.user)
      localStorage.setItem('token', info.token)
      // determine if admin role when login
      this.checkIfAdminRole()

      this.$router.push('/')
    })

    // app sign out event
    this.$services.on('app:signout', () => {
      this.$ws.resetLocalCredentials()
    })

    this.$ws.socket.on('service:event:dlake:notifications:add',
      this.handleNotification)

    // determine if admin role when authentication without login
    this.checkIfAdminRole()

    // context bar management
    this.$services.on('app:context:bar', ctxComponent => {
      // use null to disable
      this.contextComponent = ctxComponent
    })

    // application notifications
    this.$services.on('app:notification', message => {
      this.notification = message
    })

    // progress bar events
    this.$services.on('app:progress:show', show => {
      this.showProgressBar = show
      this.$forceUpdate()
      console.log('SHOW', show)
    })

    this.$services.on('app:progress', val => {
      this.progress = val
    })
  }
}
</script>

<style scoped>
.app-layout {
  background: white!important;
}

.app-layout.login {
  background-image: url(~/assets/bk_aerial.jpg)!important;
  background-size: cover!important;
  background-position: center!important;
  background-repeat: no-repeat!important;
}

.app-view {
  height: calc(100vh - 48px);
}

.app-ctx {
  height: calc(100% - 0px);
  overflow: hidden;
}

.app-router {
  top: 48px;
  height: calc(100% - 0px);
}

.app-bar {
  width: 100%;
}

.app-menu {
  margin: 0 16px;
  display: flex;
  align-items: center;
  user-select: none;
}

.app-menu-item {
  margin: 0 16px;
  color: dimgray;
  font-variant: small-caps;
  cursor: pointer;
}

.app-menu-item:hover {
  color: dodgerblue;
  text-decoration: underline;
}

.app-menu-item.selected {
  color: dodgerblue;
  text-decoration: underline;
}

@media screen and (max-width: 600px) {
  .app-view {
    padding: 0!important;
  }
}
</style>
