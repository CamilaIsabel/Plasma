export const state = () => ({
  selectedItems: [],
  currentCustomerName: "",
  description: "",
});

export const mutations = {
  setItems(state, items) {
    state.selectedItems = items;
  },
  setCustomerName(state, name) {
    state.currentCustomerName = name;
  },
  clearCustomerName(state) {
    state.currentCustomerName = "";
    state.description = "";
  },
  setDescription(state, text) {
    state.description = text;
  },
  remove(state, item) {
    const index = state.selectedItems.findIndex(
      (entry) => entry.code === item.code
    );
    state.selectedItems.splice(index, 1);
  },
  clear(state) {
    state.selectedItems = [];
  },
};
