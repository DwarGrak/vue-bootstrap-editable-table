<template>
  <div class="table">
    <t-head
      :fields="fields"
      :delete-mode="deleteMode"
      @add-col="$emit('add-col', $event)"
      @del-col="$emit('del-col', $event)"
      @delete-mode="deleteMode = $event"
    ></t-head>

    <div class="table-body" v-click-outside="onClickOutside">
      <t-row v-for="row in rows" :key="String(row.name).replace(/ /g, '_')"
        :fields="fields"
        :value="row"
        :editField="(row.name === editableCell.row) ? editableCell.field : undefined"
        :delete-mode="deleteMode"
        @click="onClickCell"
        @del-row="onDeleteRow(row.name)"
        @change="onChangeValueInCell"
        @change-valid="onChangeValidInCell"
      ></t-row>
    </div>

    <t-total
      :fields="fields"
      :value="aggregatedData"
      @change-aggregating="$emit('change-aggregating', $event)"
    ></t-total>

    <t-add-row
      :fields="fields"
      @add-row="$emit('add-row')"
    ></t-add-row>

    <promt-url
      v-model="url"
      @change="onChangeValueInCell"
      @change-valid="onChangeValidInCell"
    ></promt-url>
  </div>
</template>

<script>
import PromtUrl from '~/components/promt-url.vue';
import tAddRow from './t-add-row.vue'
import tTotal from './t-total.vue'
import tHead from './t-head.vue'
import tRow from './t-row.vue'

export default {
  name: 'editable-table',
  components: {
    PromtUrl,
    tAddRow,
    tTotal,
    tHead,
    tRow
  },
  props: {
    fields: { type: Array, required: true },
    rows: { type: Array, required: true },
    aggregatedData: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      editableCell: {
        field: undefined,
        row: undefined,
        isValid: true
      },
      url: {
        value: '',
        field: null,
        rowName: null
      },
      deleteMode: false
    }
  },
  methods: {
    onClickCell({ fieldName, rowName }) {
      // console.log(`Cell clicked fieldName:${fieldName}, rowName:${rowName}`);
      if (!this.editableCell.isValid) return;

      this.deleteMode = false;

      if (rowName !== this.editableCell.row) {
        this.editableCell.field = undefined;
        this.editableCell.row = rowName;
      }

      const field = this.fields.find(el => el.name === fieldName);

      if (fieldName === 'name') {
        this.editableCell.field = undefined;
      } else if (field.type === 'image') {
        const row = this.rows.find(el => el.name === rowName);
        if (!row) return;

        this.url.value = row[fieldName];
        this.url.field = field;
        this.url.rowName = rowName;
        this.$bvModal.show('modal-promt-url');
      } else if (this.editableCell.field === fieldName) {
        this.editableCell.field = undefined;
      } else {
        this.editableCell.field = fieldName;
      }
    },
    onDeleteRow(rowName) {
      this.$emit('del-row', rowName);
    },
    onChangeValueInCell(payload) {
      this.$emit('change', payload);
      this.unEditable();
    },
    onChangeValidInCell({ fieldName, rowName, isValid }) {
      this.isValid = isValid;
    },
    onClickOutside(event) {
      this.unEditable();
    },
    unEditable() {
      if (!this.editableCell.isValid) return;

      this.editableCell.field = undefined;
      this.editableCell.row = undefined;
    }
  }
}
</script>

<style>
  .table {
    /* structure */
    display: flex;
    flex-flow: column nowrap;
    flex: 1 1 auto;
    /* min-width: 1024px; */
    /* design */
    font-size: 1rem;
    margin: 0.5rem;
    line-height: 1.5;
    padding-bottom: 2rem;
    justify-content: center;
    text-align: center;
  }

  .td .btn:focus, .btn-focus {
    box-shadow: none;
  }

  .clear-btn-style {
    outline: none;

    border: none;
    margin: 0;
    padding: 0;
    width: auto;
    overflow: visible;

    background: transparent;

    /* inherit font & color from ancestor */
    color: inherit;
    font: inherit;

    /* Normalize `line-height`. Cannot be changed from `normal` in Firefox 4+. */
    line-height: normal;

    /* Corrects font smoothing for webkit */
    -webkit-font-smoothing: inherit;
    -moz-osx-font-smoothing: inherit;

    /* Corrects inability to style clickable `input` types in iOS */
    -webkit-appearance: none;
  }

  .del-btn {
    width: 21px;
    height: 21px;
    border-radius: 21px;
    position: absolute;
    z-index: 1;
    cursor: pointer;
  }

  .top-position {
    top: -20px;
  }

  .left-position {
    left: 0px;
  }

  .del-btn:focus {
    outline: none;
  }

  .del-btn:before {
    content: '+';
    color: #007bff;
    position: absolute;
    z-index: 2;
    transform: rotate(45deg);
    font-size: 30px;
    line-height: 1;
    top: -6px;
    left: 2px;
    transition: all 0.3s cubic-bezier(0.77, 0, 0.2, 0.85);
  }

  .del-btn:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 100%;
    background: #007bff;
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.77, 0, 0.2, 0.85);
    transform: scale(0.01);
  }

  .del-btn:hover:after {
    transform: scale(1);
  }

  .del-btn:hover:before {
    transform: scale(0.8) rotate(45deg);
    color: #fff;
  }
</style>
