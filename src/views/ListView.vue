<template>
  <div class="list-layout">
    <div class="list-left-panel">
      <v-progress-linear v-if="loading"
        indeterminate class="list-progress-bar"></v-progress-linear>

      <v-list class="list">
        <v-list-item v-for="(item, index) in items" :key="index"
          @click.stop="handleSelect(item)"
          :class="{ 'selected': selected === item }">
          <v-list-item-avatar>
            <v-img :src="item.icon ?
              $utils.fileUrl(item.icon) :
              'assets/icons/item.png'" alt=""></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              v-text="'' + (item.name || item.title || item.description)">
            </v-list-item-title>
            <v-list-item-subtitle v-text="item._id + ''"></v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>
            <v-btn icon @click.stop="handleDelete(item)">
              <v-icon color='red darken-1'>clear</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>

    <div class="list-json-viewer tw-w-3/4 tw-p-1 tw-overflow-auto">
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import jsonPretty from 'json-pretty-html'

export default {
  data: () => {
    return {
      selected: null,
      items: [],
      jsonHTML: null,
      loading: false
    }
  },
  methods: {
    handleScroll(event) {
      let element = event.target

      if (element.scrollHeight - element.scrollTop === element.clientHeight) {
        this.showNextElements()
      }
    },
    showNextElements() {
      this.loading = true
      this.items = _.concat(this.items,
        _.slice(this.itemsData, this.nextIndex, this.nextIndex + 100))
      this.nextIndex += 100
      setTimeout(() => this.loading = false, 500)
    },
    handleSelect(item) {
      this.selected = item
      this.jsonHTML = jsonPretty(item)
      d3.select(this.$el).select('.list-json-viewer').html(this.jsonHTML)

      if (this.backOnSelect) {
        this.$router.push({ path: this.backOnSelect, query: { data: this.selected }})
      }
    },
    handleFileLoaded(data) {
      try {
        data = JSON.parse(data)
        this.$db.collection(this.collection).then(items => {
          items.dPut(data).then(result => {
            console.log('item loaded', result)
            this.update()
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
      } catch (err) {
        console.log(err)
      }
    },
    handleDelete(item) {
      if (item._id) {
        this.$db.collection(this.collection).then(items => {
          items.dDelete(item).then(result => {
            console.log('deleted', item._id)
            this.update()
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
      }
    },
    handleSearch(data) {
      this.update(data)
    },
    update(filter) {
      if (this.collection) {
        this.items = []
        this.$db.collection(this.collection).then(items => {
          items.dFind({}).then(docs => {
            this.itemsData = docs
            this.nextIndex = 0

            if (filter) {
              this.itemsData = _.filter(this.itemsData, e => {
                return !!JSON.stringify(e).match(filter)
              })
            }

            this.showNextElements()
          }).catch(err => console.log(err))
        }).catch(err => console.log(err))
      }
    }
  },
  mounted() {
    this._listeners = {
      onFileLoaded: this.handleFileLoaded.bind(this),
      onSearch: this.handleSearch.bind(this)
    }

    let listEl = d3.select(this.$el).select('.list').node()
    listEl.addEventListener('scroll', this.handleScroll.bind(this))

    console.log(this.$router.currentRoute)
    this.collection = this.$router.currentRoute.query.collection
    console.log('LIST', this.collection)

    this.backOnSelect = this.$router.currentRoute.query.backOnSelect

    this.update()

    this.$services.emit('app:context:bar', 'list-ctx')

    this.$services.on('view:list:loaded', this._listeners.onFileLoaded)
    this.$services.on('view:list:search', this._listeners.onSearch)
  },
  beforeDestroy() {
    this.$services.emit('app:context:bar', null)

    this.$services.off('view:list:loaded', this._listeners.onFileLoaded)
    this.$services.off('view:list:search', this._listeners.onSearch)
  }
}
</script>

<style>
.list-layout {
  display: flex;
  width: 100%;
  height: calc(100% - 0px);
}

.list-left-panel {
  width: 33%;
}

.list-progress-bar {
  position: absolute;
  width: 100%;
}

.list-json-viewer {
  width: 67%;
  height: calc(100% - 0px);
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 0;
  text-align: left;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 0;
}

.list-json-viewer .json-key {
  color: dodgerblue;
  font-weight: bold;
}

.list-json-viewer .json-pretty {
    padding-left: 30px;
    padding-right: 30px;
}

.list-json-viewer .json-selected {
  background-color: rgba(139, 191, 228, 0.19999999999999996);
}

.list-json-viewer .json-string {
  color: #6caedd;
}

.list-json-viewer .json-key {
  color: #ec5f67;
}

.list-json-viewer .json-boolean {
    color: #99c794;
}

.list-json-viewer .json-number {
    color: #99c794;
}

</style>
