/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global after, describe, it, before, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var Immutable = require('immutable');
var objectAssign = require('lodash/object/assign');
var testDom = require('../../utils/testdom');
var jsonToFluxible = require('../../../utils').createFluxibleRouteTransformer({
  actions: require('../../../actions/interface')
}).jsonToFluxible;

describe('application component', function () {
  var createMockComponentContext,
      ApplicationStore, ContentStore, RouteStore, ContactStore, BackgroundStore,
      serviceData, routesResponse, fluxibleRoutes, fluxibleApp,
      React, ReactAddons, testUtils,
      routes;

  before(function () {
    // We'll be rendering the isomorphic component, so set dom env for react here
    testDom.start();

    // Now proceed to load modules that might use React
    createMockComponentContext = require('fluxible/utils').createMockComponentContext;
    ApplicationStore = require('../../../stores/ApplicationStore');
    ContentStore = require('../../../stores/ContentStore');
    RouteStore = require('../../../stores/RouteStore');
    ContactStore = require('../../../stores/ContactStore');
    BackgroundStore = require('../../../stores/BackgroundStore');
    serviceData = require('../../fixtures/service-data');
    routesResponse = require('../../fixtures/routes-response');
    fluxibleRoutes = jsonToFluxible(routesResponse);
    fluxibleApp = require('../../../app');
    React = require('react');
    ReactAddons = require('react/addons');

    testUtils = ReactAddons.addons.TestUtils;

    routes = {
      home: objectAssign({}, fluxibleRoutes.home, {
        url: '/',
        name: 'home',
        params: {},
        query: {}
      }),
      about: objectAssign({}, fluxibleRoutes.about, {
        url: '/about',
        name: 'about',
        params: {},
        query: {}
      }),
      contact: objectAssign({}, fluxibleRoutes.contact, {
        url: '/contact',
        name: 'contact',
        params: {},
        query: {}
      })
    };
  });

  after(function () {
    testDom.stop();
  });

  describe('home', function () {
    var appElement, context, homePage;

    function makeHomePath () {
      return '/';
    }

    before(function () {
      homePage = {
        resource: routesResponse.home.action.params.resource
      };

      serviceData.fetch(homePage, function(err, data) {
        if (err) {
          throw err;
        }
        homePage.data = data;
      });
    });

    beforeEach(function () {
      context = createMockComponentContext({
        stores: [
          ApplicationStore,
          ContentStore,
          RouteStore,
          ContactStore,
          BackgroundStore
        ]
      });
      context.makePath = makeHomePath;

      var routeStore = context.getStore(RouteStore);
      var appStore = context.getStore(ApplicationStore);
      var contentStore = context.getStore(ContentStore);

      routeStore._handleReceiveRoutes(fluxibleRoutes);
      routeStore._handleNavigateStart(routes.home);
      routeStore._handleNavigateSuccess(Immutable.fromJS(routes.home));
      appStore.updatePageTitle({ title: 'test' });
      contentStore.receivePageContent(homePage);

      appElement = React.createElement(fluxibleApp.getComponent(), {
        context: context
      });
    });

    it('should render home content', function () {
      var app = testUtils.renderIntoDocument(appElement);

      var components = testUtils.scryRenderedDOMComponentsWithClass(app, 'page-content');

      // 'Home' comes from service-data, not the real doc
      expect(components[0].getDOMNode().textContent).to.match(/Home/i);
    });

    it('should render home navigation', function () {
      var app = testUtils.renderIntoDocument(appElement);

      // throws if not exactly 1
      var component = testUtils.findRenderedDOMComponentWithClass(app, 'selected');

      expect(component.getDOMNode().textContent).to.match(/Home/i);
    });
  });
});
