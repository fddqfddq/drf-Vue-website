import store from './store';
import axios from 'axios';

const restoreStateFromSessionStorageIfExist = function () {
    if (window.sessionStorage.userName) {
        store.commit('setUserName', window.sessionStorage.userName);
    }
    if (window.sessionStorage.AuthorizationHeader) {
        axios.defaults.headers.common['Authorization'] = window.sessionStorage.AuthorizationHeader;
    }
    if (window.sessionStorage.categoryList) {
        const categoryList = JSON.parse(window.sessionStorage.categoryList);
        store.commit('setCategoryList', categoryList);
    }
};

const setAuthorizationToken = function (jwtToken) {
    const authorizationHeader = 'JWT ' + jwtToken;
    axios.defaults.headers.common['Authorization'] = authorizationHeader;
    window.sessionStorage.AuthorizationHeader = authorizationHeader;
};

const requestCategoryListWithCache = function (callbackFun) {
    if (store.state.categoryList) {
        callbackFun(store.state.categoryList);
        return store.state.categoryList;
    }
    axios.get('categorys/')
        .then((res) => {
            const categoryList = res.data;
            window.sessionStorage.categoryList = JSON.stringify(categoryList);
            store.commit('setCategoryList', categoryList);
            callbackFun(categoryList);
        }, (err) => {
            var errorReasonDict = err.body;
            console.log('---errorReasonDict---');
            console.log(errorReasonDict);
        });
    return false;
};

const requestListInfo = function (vuexState) {
    var self = vuexState.listComponent;
    if (!self) {
        return;
    }
    var requestUrl = self.requestUrl + '?';
    requestUrl = requestUrl + 'page' + '=' + vuexState.currPageNum + '&';
    requestUrl = requestUrl + 'page_size' + '=' + vuexState.currPageSize + '&';
    for (var key in vuexState.filterCondition) {
        requestUrl = requestUrl + key + '=' + vuexState.filterCondition[key] + '&';
    }
    requestUrl = requestUrl.slice(0, -1);
    if (requestUrl === vuexState.lastRequestUrl) {
        return;
    }
    vuexState.lastRequestUrl = requestUrl;
    console.log('---requestUrl---');
    console.log(requestUrl);
    self.$axios.get(requestUrl)
        .then((res) => {
            vuexState.listComponent.previousPageUrl = res.data['previous'];
            vuexState.listComponent.nextPageUrl = res.data['next'];
            vuexState.listComponent.sumPageNum = Math.ceil(res.data['count'] / vuexState.currPageSize);
            self.setOutlineList(res.data.results);
        }, (err) => {
            var errorReasonDict = err.body;
            console.log('---errorReasonDict---');
            console.log(errorReasonDict);
        });
};

export default {
    requestListInfo,
    setAuthorizationToken,
    restoreStateFromSessionStorageIfExist,
    requestCategoryListWithCache
};
