import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)


const store = new Vuex.Store({
	state: {
		drawType: ''
	},

	mutations: {
		TOOGLE_TOOLS: (state, type) =>{
			state.drawType = type
		}
	},


	actions: {

	},

	getters: {

	}
})

export default store