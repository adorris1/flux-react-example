/**
 * Copyright (c) 2015 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global afterEach, describe, it, beforeEach */
'use strict';

require('node-jsx').install({ extension: '.jsx' });

var expect = require('chai').expect;
var testUtils = require('react-addons-test-utils');
var ApplicationStore = require('../../../stores/ApplicationStore');
var BackgroundStore = require('../../../stores/BackgroundStore');
var HtmlComponent = require('react')
  .createFactory(require('../../../components/Html.jsx'));
var createMockComponentContext = require('fluxible/utils').createMockComponentContext;
// HtmlComponent never renders on the client, so dont make dom until test render
var testDom = require('../../utils/testdom');

describe('html component', function () {
  var htmlComponent;

  var testProps = {
    images: 'path/to/images',
    mainScript: 'path/to/mainScript',
    trackingSnippet: 'someTrackingCode',
    headerStyles: '@charset "UTF-8";',
    headerScript: 'window["MyTest"] = 0;',
    state: '123456789',
    markup: 'Hello World'
  };

  /**
   * renderIntoDocument for html element.
   *
   * Replaces testUtils.renderIntoDocument.
   * renderIntoDocument no longer supports React html components as it wraps
   * everything in a div.
   * https://github.com/facebook/react/issues/5128
   *
   * Must start testDom (jsdom) first.
   *
   * @param {ReactElement} el - the html element.
   * @returns {ReactComponent} The html component.
   */
  function renderHtmlIntoDocument (el) {
    var ReactDOM = require('react-dom');
    var ReactDOMServer = require('react-dom/server');

    var iframe = global.document.createElement('iframe');

    global.document.body.appendChild(iframe);
    iframe.src = 'about:blank';
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(ReactDOMServer.renderToString(el));
    iframe.contentWindow.document.close();
    return ReactDOM.render(el, iframe.contentWindow.document);
  }

  beforeEach(function () {
    testProps.context = createMockComponentContext({
      stores: [ApplicationStore, BackgroundStore]
    });
    var htmlElement = HtmlComponent(testProps);

    // This enables dom render after HtmlComponent factory call.
    // This mimics what really happens.
    testDom.start();

    // Go ahead and renderIntoDocument. Keep reference in htmlComponent.
    htmlComponent = renderHtmlIntoDocument(htmlElement);
  });

  afterEach(function () {
    // Remove the dom for the next HtmlComponent factory call.
    testDom.stop();
  });

  // Reference ONLY. https://github.com/facebook/react/issues/5128
  it.skip('this is a general test of the iframe solution', function () {
    var React = require('react');
    var ReactDOM = require('react-dom');

    var klass = React.createClass({
      render: function () {
        return React.DOM.html(null, React.DOM.body(null, React.DOM.div(null, React.DOM.span(null, 'hello'))));
      }
    });

    var el = React.createElement(klass);

    var iframe = global.document.createElement('iframe');

    // lets see if I even get an iframe.
    // console.log("iframe = ", iframe);
    global.document.body.appendChild(iframe);
    iframe.src = 'about:blank';
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(React.renderToString(el));
    iframe.contentWindow.document.close();
    var component = ReactDOM.render(el, iframe.contentWindow.document);
    var found = testUtils.findRenderedDOMComponentWithTag(component, 'span');

    console.log('test = ' + found.textContent);
  });

  it('should render a header style', function () {
    var component = testUtils.findRenderedDOMComponentWithTag(htmlComponent, 'style');
    expect(component.textContent).to.equal(testProps.headerStyles);
  });

  it('should render a title', function () {
    var component = testUtils.findRenderedDOMComponentWithTag(htmlComponent, 'title');
    expect(component.textContent).to.be.empty;
  });

  it('should render a section', function () {
    var component = testUtils.findRenderedDOMComponentWithTag(htmlComponent, 'section');
    expect(component.textContent).to.equal(testProps.markup);
  });

  it('should render multiple scripts', function () {
    var component = testUtils.scryRenderedDOMComponentsWithTag(htmlComponent, 'script');

    expect(component.length).to.equal(4);
    expect(component[0].textContent).to.equal(testProps.trackingSnippet);
    expect(component[1].textContent).to.equal(testProps.headerScript);
    expect(component[2].textContent).to.equal(testProps.state);
    expect(component[3].textContent).to.be.empty;
    expect(component[3].getAttribute('src')).to.equal(testProps.mainScript);
  });
});
