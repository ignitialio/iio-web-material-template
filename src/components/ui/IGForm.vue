<template>
  <div v-if="schema._meta" class="ig-form">
    <div v-if="isObjectId(value) || isPrimitive(value) || value === null"
      class="ig-form-content">

      <div class="ig-form-items" :class="{
          'half': editable,
          'threequarter': !editable
        }">

        <v-select v-if="schema.enum" :label="$t(name)"
          :disabled="editable"
          :items="schema.enum" :value="value" @input="handleInput"></v-select>

        <div class="ig-form-hgroup"
          v-else-if="schema._meta && schema._meta.type === 'image'">
          <v-img style="border: 1px solid gainsboro"
            v-if="schema._meta.showThumbnail"
            aspect-ratio="1" max-width="64" max-height="64"
            :src="value"></v-img>

          <v-file-input
            :disabled="editable" @input="handleInput"
            :label="$t(name)"></v-file-input>
        </div>

        <div class="ig-form-hgroup"
          v-else-if="schema._meta && schema._meta.type === 'file'">
          <v-text-field
            :readonly="isReadOnly"
            :disabled="editable"
            :value="value" @input="handleInput"
            :label="$t(name)"></v-text-field>

          <v-file-input
            :disabled="editable"
            :value="normalizedFileUrl(value)" @input="handleInput"
            :label="$t(name)"></v-file-input>
        </div>

        <v-date-picker
          v-else-if="schema._meta && schema._meta.type && schema._meta.type.match(/date|time/)"
          :disabled="editable"
          :value="new Date(value).toISOString().slice(0, 10)" @input="handleInput"
          :label="$t(name)"></v-date-picker>

        <v-text-field v-else
          :readonly="isReadOnly"
          :disabled="editable"
          :value="value" @input="handleInput"
          :label="$t(name)"></v-text-field>
      </div>

      <!-- Meta edition: editing the schema -->
      <div class="ig-form-meta" v-if="editable">
        <v-select :label="$t('Type')"
          :items="jsonTypes" v-model="schema.type"></v-select>

        <v-btn v-if="hasSettings" icon @click="handleSettingsDialog(schema)">
          <v-icon>settings</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- next level -->
    <div v-if="value && !isPrimitive(value) && schema.properties &&
      schema.type !== 'array' && schema._meta.type !== 'geopoint'"
      class="ig-form-next"
      v-for="(prop, index) in properties" :key="index">

      <div v-if="!isObjectId(value[prop]) && !isPrimitive(value[prop])"
        class="ig-form-next-header">
        <div class="ig-form-next-header--text"
          :class="{ 'tw-text-gray-400': editable }">
          {{ translation(prop, schema.properties[prop]) }}</div>

        <div v-if="hasSettings && editable"
          class="ig-form-next-header--actions">
          <v-btn icon
            @click.stop="handleSettingsDialog(schema.properties[prop])">
            <v-icon>settings</v-icon>
          </v-btn>
        </div>
      </div>

      <ig-form :name="prop"
        :schema.sync="schema.properties[prop]"
        @update:schema="handleUpdateSchema(prop, $event)"
        class="ig-form-next-form"
        v-model="value[prop]" :editable="editable"></ig-form>
    </div>

    <div v-if="value && schema.type === 'array'"
      class="ig-form-next">
      <ig-form v-if="!Array.isArray(schema.items) && schema.items.type !== 'object'"
        v-for="(item, index) in value" :key="index"
        :name="translation('item', schema.items)"
        :schema.sync="schema.items"
        @update:schema="handleUpdateSchema(null, $event)"
        class="ig-form-next-object"
        :value="item" :editable="editable"></ig-form>

      <ig-form v-if="schema.items.type === 'object'"
        v-for="(item, index) in value" :key="index"
        :name="translation('item', schema.items) + '[' + index + ']'"
        :schema.sync="schema.items"
        @update:schema="handleUpdateSchema($t('item'), $event)"
        class="ig-form-next-object"
        :value="item" :editable="editable"></ig-form>

      <ig-form v-if="itemSchema && Array.isArray(schema.items)"
        v-for="(itemSchema, index) in schema.items" :key="index"
        :name="translation('item', itemSchema)"
        :schema.sync="itemSchema"
        @update:schema="handleUpdateSchema($t('item'), $event)"
        class="ig-form-next-object"
        :value="value[index]" :editable="editable"></ig-form>
    </div>

    <v-btn icon
      v-if="schema.type === 'array' && !Array.isArray(schema.items)"
      @click.stop="handleAddItem">
      <v-icon color="green darken-2">add</v-icon>
    </v-btn>

    <div v-if="schema._meta.type === 'geopoint'"
      class="ig-form-geo">
      <ig-geo v-if="schema._meta.type === 'geopoint'"
        :disabled="editable" :marker="value" @update:marker="handleGeoloc"/>
    </div>

    <!-- Schema settings dialog -->
    <ig-form-settings ref="settings" v-model="settingsDialog"
      :name="name"
      :schema.sync="schemaOnEdit"></ig-form-settings>
  </div>
</template>

<script>
import _ from 'lodash'
import bson from 'bson'

export default {
  name: 'ig-form',
  props: {
    name: {
      type: String
    },
    value: {},
    editable: {
      type: Boolean
    },
    schema: {
      type: Object
    }
  },
  watch: {
    'schema._meta.type': function(val) {
      this._schema._meta.type = val

      switch (val) {
        case 'enum':
          this._schema.enum = this._schema.enum || []
          break

        case 'image':
          this._schema._meta.imageType = 'image/*'
          break

        case 'file':
          this._schema._meta.fileType = '*/*'
          break

        case 'date':
          this._schema.format = 'date'
          break

        case 'time':
          this._schema.format = 'time'
          break

        case 'datetime':
          this._schema.format = 'datetime'
          break

        default:

      }

      this.$emit('update:schema', this._schema)
    },
    'schema.enum': function(val) {
      this.$refs.settings.$forceUpdate()
    }
  },
  data: () => {
    return {
      jsonTypes: [
        {
          value: 'boolean',
          text: 'Boolean'
        },
        {
          value: 'string',
          text: 'String'
        },
        {
          value: 'number',
          text: 'Number'
        },
        {
          value: 'integer',
          text: 'Integer'
        },
        {
          value: 'null',
          text: 'Null'
        },
        {
          value: 'objectid',
          text: 'ObjectID'
        }
      ],
      hasSettings: false,
      settingsDialog: false,
      schemaOnEdit: null
    }
  },
  methods: {
    isObjectId(obj) {
      let isObjectId = obj ? obj._bsontype === 'ObjectID' : false

      if (isObjectId && (this.value === obj)) {
        this.handleType('objectid')
      }

      return isObjectId
    },
    isPrimitive(obj) {
      return !(typeof obj === 'object') && !Array.isArray(obj)
    },
    handleType(val) {
      switch (val) {
        case 'objectid':
          this._schema.readOnly = true
          break

        default:
      }

      this.$emit('update:schema', this._schema)
    },
    updateSettings() {
      if (!this._schema._meta) return
      switch (this._schema._meta.type) {
        case 'null':
          this.hasSettings = false
          break
        case 'objectid':
          this.hasSettings = false
          break
        default:
          this.hasSettings = true
      }
    },
    handleSettingsDialog(schema) {
      this.schemaOnEdit = schema
      console.log($j(this.schemaOnEdit))
      this.settingsDialog = true
    },
    handleInput(val) {
      this.$emit('input', val)
    },
    handleGeoloc(val) {
      console.log('GEOLOC', val)
      if (this._schema.type === 'object') {
        this.$emit('input', {
          latitude: val[1],
          longitude: val[0]
        })
      } else {
        this.$emit('input', val)
      }
    },
    handleUpdateSchema(prop, val) {
      if (this.schema.type === 'object') {
        this._schema.properties[prop] = val
      } else if (this.schema.type === 'array') {
        this._schema.items = val
      }

      this.$emit('update:schema', this._schema)
    },
    handleAddItem() {
      let data = this.$utils.generateDataFormJSONSchema(this.schema).json
      console.log('adding', data[0])
      let arr = this.value.concat([ data[0] ])

      this.$emit('input', arr)
    },
    translation(prop, schema) {
      if (!schema) {
        console.log('!!! no schema for translation')
        return
      }

      if (schema._meta && schema._meta.i18n) {
        let lang = this.$i18n._language.slice(0, 2)
        return schema._meta.i18n[lang]
      } else if (schema.description) {
        return this.$t(schema.description)
      } else if (prop) {
        return this.$t(prop)
      }

      return this.$t(name)
    },
    normalizedFileUrl(url) {
      let arr = url.split('/')

      return arr[arr.length - 1]
    }
  },
  async beforeMount() {
    if (!this.schema) {
      console.error('!!! no schema', this.name, $j(this.value))
    }

    this._schema = _.cloneDeep(this.schema)
    this._schema._meta = this._schema._meta || { type: null }
    this.$emit('update:schema', this._schema)
    // console.log(this.name, $j(this._schema))
  },
  mounted() {
    this.updateSettings()

    // future use: sets root component for all
    if (this.$parent) {
      if (this.$parent.$options._componentTag === 'ig-form') {
        this._formRootElement = this.$parent._formRootElement
      } else {
        this._formRootElement = this.$parent.$el
      }
    }
  },
  computed: {
    properties() {
      if (this.value && (typeof this.value === 'object' || Array.isArray(this.value))) {
        return Object.keys(this.value)
      }

      return []
    },
    isReadOnly() {
      return !!this.schema.readOnly
    }
  }
}
</script>

<style scoped>
.ig-form {
  width: calc(100% - 0px);
  height: calc(100% - 0px);
  display: flex;
  flex-flow: column;
  overflow-y: auto;
}

.ig-form-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.ig-form-next {
  width: 100%;
  display: flex;
  flex-flow: column;
}

.ig-form-next-header {
  display: flex;
  align-items: center;
}

.ig-form-next-header--text {
  margin: 16px 0px;
  font-weight: bold;
}

.ig-form-next-header--actions {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.ig-form-next-form {
  width: calc(100% - 10px);
  margin: 2px 2px 2px 8px;
  border: 1px solid rgba(100, 100, 100, 0.1);
  padding: 2px 4px;
}

.ig-form-next-object {
  margin-left: 8px;
  width: calc(100% - 8px);
  border: 1px solid rgba(100, 100, 100, 0.1);
}

.ig-form-geo {
  width: 100%;
  display: flex;
  flex-flow: column;
}

.ig-form-meta {
  width: 25%;
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.ig-form-hgroup {
  display: flex;
  align-items: center;
}

.ig-form-items.half {
  width: 50%;
}

.ig-form-items.threequarter {
  width: 75%;
}

.enums {
  height: calc(100% - 0px);
}

@media screen and (max-width: 800px) {

}
</style>
