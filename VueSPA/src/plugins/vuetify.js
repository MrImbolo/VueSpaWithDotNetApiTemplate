// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
export const vuetifyOptions = {
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        }
    },
    theme: {
        defaultTheme: 'sample',
        themes: {
            sample: {
                colors: {
                    primary: '#EE8002',
                    //background: '#FFFFFF',
                    //surface: '#FFFFFF',
                    //primary: '#6200EE',
                    //'primary-darken-1': '#3700B3',
                    secondary: '#0270ee',
                    //'secondary-darken-1': '#018786',
                    error: '#ee0a02',
                    info: '#fef3e0',
                    success: '#02ee80',
                    warning: '#e6ee02',
                }
            }
        }
    }
};
