<template>
    <v-app id="inspire">
        <v-navigation-drawer v-model="menuOpened" app temporary v-if="isLoggedIn">
            <v-list-item 
                v-if="isLoggedIn"
                prepend-avatar="https://randomuser.me/api/portraits/men/78.jpg"
                title="User Name"></v-list-item>

            <v-divider></v-divider>

            <v-list density="compact" nav>
                <v-list-item prepend-icon="mdi-view-dashboard" title="Home" value="home" to="/"></v-list-item>
                <v-list-item prepend-icon="mdi-forum" title="About" value="about" to="/about"></v-list-item>
            </v-list>

            <template v-slot:append>
                <div class="pa-2">
                    <v-btn block color="secondary">
                        Logout
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>

        <v-app-bar app density="compact" v-if="isLoggedIn">
            <v-app-bar-nav-icon @click="menuOpened = !menuOpened"></v-app-bar-nav-icon>

            <v-toolbar-title>Application</v-toolbar-title>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <v-row dense>
                    <router-view></router-view>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
    import { computed } from 'vue'
    import { useStore } from 'vuex'

    export default {

        setup() {
            const store = useStore();

            return {
                menuItems: computed(() => store.state.menu.items),
                menuOpened: computed({
                    get: () => store.state.menu.opened,
                    set: (val) => store.commit('menu/mSetOpened', val)
                }),
                isLoggedIn: computed(() => store.state.user.isLoggedIn)
            }
        }        
    }
</script>