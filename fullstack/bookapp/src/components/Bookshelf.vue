<template>
  <div class="bookshelf">
    <div class="book" v-for="book in books" :key="book.id">
      <img
        class="cover"
        :src="book.cover_picture"
        :alt="book.name"
        width="120"
        height="160"
        @click="toPage(book.id)"
      />
      <div class="info">
        <div class="title" @click="toPage(book.id)">
          <h2 class="book-title">{{ book.name }}</h2>
          <p class="book-author">{{ book.author }}</p>
          <p class="book-category">{{ book.category }}</p>
        </div>
        <div
          v-if="checkLike(book.users_who_liked)"
          @click="dislike(book.id)"
          class="like"
        >
          <img src="@/assets/liked.png" width="24" />
        </div>
        <div v-else class="like" @click="like(book.id)">
          <img src="@/assets/like.png" width="24" />
        </div>
      </div>
    </div>
    <div class="pagination">
      <vue-ads-pagination
        :total-items="total"
        :page="page"
        :items-per-page="limit"
      >
        <template slot="buttons" slot-scope="props">
          <vue-ads-page-button
            v-for="(button, key) in props.buttons"
            :key="key"
            v-bind="button"
            :class="{ 'bg-yellow-dark': button.active }"
            @page-change="page = button.page"
            @range-change="
              start = button.start
              end = button.end
            "
          />
        </template>
      </vue-ads-pagination>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/index.js'
import VueAdsPagination, { VueAdsPageButton } from 'vue-ads-pagination'
import '../../node_modules/@fortawesome/fontawesome-free/css/all.css'
import '../../node_modules/vue-ads-pagination/dist/vue-ads-pagination.css'

export default {
  name: 'Bookshelf',
  props: {
    selected: {
      type: String,
      default: ''
    }
  },
  components: {
    VueAdsPagination,
    VueAdsPageButton
  },
  data() {
    return {
      books: [],
      page: 0,
      limit: 8,
      filter: '',
      order: '',
      liked: false,
      stock: false,
      start: 0,
      end: 0,
      total: 0
    }
  },
  computed: {
    query() {
      return this.$store.state.searchBook
    },
    url() {
      let config = [
        {
          name: 'filter',
          value: this.filter
        },
        {
          name: 'order',
          value: this.order
        },
        {
          name: 'query',
          value: this.query
        },
        {
          name: 'liked',
          value: this.liked
        },
        {
          name: 'stock',
          value: this.stock
        }
      ]

      config = config
        .map((item) => {
          if (item.value) {
            return `${item.name}=${item.value}`
          }
        })
        .filter((item) => item)
        .join('&')

      return `books?page=${this.page + 1}&limit=${this.limit}&${config}`
    },
    user() {
      return this.$store.state.user
    }
  },

  watch: {
    url() {
      this.getBooks()
    },
    page() {
      this.getBooks()
    },

    selected() {
      this.$store.dispatch('setPlaceholder', 'Procure um livro')
      switch (this.selected) {
        case 'best':
          this.clearFilters()
          this.filter = 'likes'
          this.order = 'desc'
          this.getBooks()
          break
        case 'stock':
          this.clearFilters()
          this.filter = 'stock'
          this.order = 'desc'
          this.stock = true
          this.getBooks()
          break
        case 'order':
          this.clearFilters()
          this.filter = 'name'
          this.getBooks()
          break
        case 'liked':
          this.clearFilters()
          this.liked = true
          this.filter = 'name'
          this.order = 'asc'
          this.getBooks()
          break
        case 'category':
          this.clearFilters()
          this.filter = 'category'
          this.order = 'asc'
          this.$store.dispatch('setPlaceholder', 'Busque por cateroria')
          this.getBooks()
          break
        default:
          break
      }
    }
  },

  created() {
    this.getBooks()
  },

  methods: {
    clearFilters() {
      this.$store.dispatch('setSearch', '')
      this.page = 0
      this.limit = 8
      this.filter = ''
      this.order = ''
      this.liked = false
      this.stock = false
      this.start = 0
    },

    checkLike(users_who_liked) {
      let liked = false
      if (users_who_liked.length > 0) {
        users_who_liked.forEach((user) => {
          if (user.id === this.user.id) {
            liked = true
          }
        })
      }
      return liked
    },

    dislike(bookId) {
      api
        .post(`/books/${bookId}`, { deslike: true })
        .then(() => this.getBooks())
    },

    like(bookId) {
      api.post(`/books/${bookId}`).then(() => this.getBooks())
    },

    getBooks() {
      api.get(this.url).then((response) => {
        this.total = Number(response.data.data.total)
        this.books = response.data.data.data
      })
    },

    pageChange(page) {
      this.page = page
    },

    rageChange(start, end) {
      this.start = start
      this.end = end
    },

    toPage(bookId) {
      this.$router.push(`/formulario/${bookId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/sass/main.scss';

.book {
  width: 310px;
  margin: 20px 0 0 0;
}

.bookshelf {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
}

.book-author {
  font-size: 0.7rem;
}

.book-category {
  font-size: 0.6rem;
}

.book-title {
  font-size: 1rem;
}

.cover {
  display: block;
  margin: 0 auto;
  height: 100;
}

.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 20px 0 30px;
}

.pagination {
  display: flex;
  margin-top: 20px;
  width: 100%;
}

.pagination div {
  display: inline-block;
  margin: 0 auto;
}

@media only screen and (max-width: 600px) {
}
</style>
