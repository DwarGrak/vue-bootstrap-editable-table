import { db } from '~/db';
import { isUndefinedOrNullOrEmpty, generateId, getValueToType } from '~/helpers';

export const state = () => ({
  items: [],
});

export const mutations = {
  add(state, data) {
    state.items.push(data);
  },
  load(state, data) {
    state.items = [];

    for (let i = 0; i < data.length; i++) {
      state.items.push(data[i]);
    }
  },
  update(state, payload) {
    const item = state.items.find(el => el.name === payload.rowName);
    if (item) {
      item[payload.fieldName] = payload.value;
    }
  },
  delete(state, query) {
    const itemIndex = state.items.findIndex(el => el.name === query.name);
    if (itemIndex > -1) {
      state.items.splice(itemIndex, 1);
    }
  }
};

export const getters = {
  items(state) {
    return state.items;
  },
  aggregationFields(state) {
    return state.items
      .filter(el => !isUndefinedOrNullOrEmpty(el.aggregate))
      .map(el => ({ field: el.name, aggregate: el.aggregate }));
  }
};

export const actions = {
  async create({ dispatch, commit }, payload) {
    const name = generateId();
    const data = { ...payload, name };

    const response = await db.post({
      table: 'fields-table',
      query: {},
      payload: data
    });

    if (response.status === 'Ok') {
      const dataUpdate = {};
      dataUpdate[name] = getValueToType(payload.type);

      let aggregation = null;
      if (payload.aggregate) {
        aggregation = {
          field: name,
          aggregate: payload.aggregate
        };
      }

      await dispatch('dataTable/updateField', {
        query: {},
        data: dataUpdate,
        aggregation
      }, { root: true });

      commit('add', data);
    }

    return response.status;
  },
  async read({ commit }) {
    const response = await db.get({ table: 'fields-table', query: {} });
    commit('load', response.data);

    return response.status;
  },
  async update({ commit, getters }, payload) {
    const data = {};
    data[payload.fieldName] = payload.value;

    const response = await db.put({
      table: 'fields-table',
      query: { name: payload.rowName },
      payload: data
    });

    if (response.status === 'Ok') {
      commit('update', payload);

      const aggregationFields = getters.aggregationFields;
      const aggregationField = aggregationFields.find(el => el.field === payload.rowName);

      if (aggregationField) {
        commit('dataTable/calculate', [aggregationField], { root: true });
      }
    }

    return response.status;
  },
  async delete({ dispatch, commit }, payload) {
    const response = await db.delete({
      table: 'fields-table',
      query: payload
    })

    if (response.status === 'Ok') {
      await dispatch('dataTable/deleteField', { query: payload }, { root: true });

      commit('delete', payload);
    }

    return response.status;
  }
};
