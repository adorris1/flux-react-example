/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
'use strict';

var React = require('react');
var ApplicationStore = require('../stores/ApplicationStore');
var ContentStore = require('../stores/ContentStore');
var RouterMixin = require('flux-router-component').RouterMixin;
var FluxibleMixin = require('fluxible/addons/FluxibleMixin');

var pages = require('./pages');
var Header = require('./header');
var Footer = require('./footer');

var Application = React.createClass({
  mixins: [ RouterMixin, FluxibleMixin ],
  statics: {
    storeListeners: [ ApplicationStore ]
  },

  getInitialState: function () {
    return this.getState();
  },
  getState: function () {
    var appStore = this.getStore(ApplicationStore);
    var contentStore = this.getStore(ContentStore);

    return {
      pageName: appStore.getCurrentPageName(),
      pageTitle: appStore.getCurrentPageTitle(),
      pageContent: contentStore.getCurrentPageContent(),
      pageModels: contentStore.getCurrentPageModels(),
      route: appStore.getCurrentRoute(),
      pages: appStore.getPages()
    };
  },
  onChange: function () {
    this.setState(this.getState());
  },

  render: function () {
    var page = pages.createElement(
      this.state.route.config.component,
      this.state.pageContent,
      this.state.pageModels
      );

    return (
      <div className="app-block">
        <Header
          selected={this.state.pageName}
          links={this.state.pages}
          models={this.state.pageModels}
        />
        {page}
        <Footer models={this.state.pageModels} />
      </div>
    );
  },

  componentDidUpdate: function (prevProps, prevState) {
    var newState = this.state;

    if (newState.pageTitle === prevState.pageTitle) {
      return;
    }

    document.title = newState.pageTitle;

    var analytics = window[this.props.analytics];
    if (analytics) {
      analytics('set', {
        page: newState.route.url,
        title: newState.pageTitle
      });
      analytics('send', 'pageview');
    }
  }
});

module.exports = Application;
