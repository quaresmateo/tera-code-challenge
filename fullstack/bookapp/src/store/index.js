import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { api } from '../services/index'
const { localStorage } = window

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  strict: true,
  state: {
    book: {},
    darkmode: false,
    logged: false,
    placeholder: 'Procure um livro',
    searchBook: '',
    user: {}
  },
  mutations: {
    UPDATE_LOGIN(state, payload) {
      state.logged = payload
    },

    UPDATE_USER(state, payload) {
      state.user = Object.assign({}, state.user, payload)
    },

    UPDATE_BOOK(state, payload) {
      if (payload) {
        state.book = Object.assign({}, state.book, payload)
      } else {
        state.book = {}
      }
    },

    UPDATE_PLACEHOLDER(state, payload) {
      state.placeholder = payload
    },

    UPDATE_SEARCH_BOOK(state, payload) {
      state.searchBook = payload
    },

    UPDATE_DARKMODE(state, payload) {
      state.darkmode = payload
    }
  },
  actions: {
    getUser(context) {
      return api.get('/user').then((response) => {
        context.commit('UPDATE_USER', response.data.data)
        context.commit('UPDATE_LOGIN', true)
      })
    },

    loginUser(_, payload) {
      return api
        .login({
          email: payload.email,
          password: payload.password
        })
        .then((response) => {
          localStorage.setItem('token', `Bearer ${response.data.data.token}`)
        })
    },

    createUser(_, payload) {
      return api.post('/user', payload)
    },

    logoutUser(context) {
      context.commit('UPDATE_BOOK', false)
      context.commit('UPDATE_USER', {})
      localStorage.removeItem('token')
      context.commit('UPDATE_LOGIN', false)
      context.commit('UPDATE_DARKMODE', false)
    },

    createBook(_, payload) {
      return api.post('/books', payload)
    },

    getBook(context, payload) {
      return api.get(`books/${payload}`).then((response) => {
        context.commit('UPDATE_BOOK', response.data.data)
      })
    },

    updateBook(context, payload) {
      return api.put(`/books/${payload.id}`, payload).then((response) => {
        context.commit('UPDATE_BOOK', response.data.data)
      })
    },

    deleteBook(context, payload) {
      return api.delete(`/books/${payload.id}`).then(() => {
        context.commit('UPDATE_BOOK', {})
      })
    },

    likeBook(context, payload) {
      return api
        .post(`/books/${payload.book.id}`, payload.deslike)
        .then((response) => {
          context.commit('UPDATE_BOOK', response.data.data)
        })
    },

    clearBook(context) {
      context.commit('UPDATE_BOOK', false)
    },

    setPlaceholder(context, payload) {
      if (payload) {
        context.commit('UPDATE_PLACEHOLDER', payload)
      }
    },

    setSearch(context, payload) {
      context.commit('UPDATE_SEARCH_BOOK', payload)
    },

    setDarkmode(context, payload) {
      context.commit('UPDATE_DARKMODE', payload)
    }
  }
})
