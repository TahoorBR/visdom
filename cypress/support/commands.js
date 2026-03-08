// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
//

import '@4tw/cypress-drag-drop';

/**
 * Custom Chai assertion: closeToPx
 *
 * Compares a CSS pixel string (e.g. "105.77px") against an expected
 * value with a configurable tolerance (default 1.5px).  This avoids
 * cross-browser failures caused by sub-pixel rounding differences
 * between Electron, Chrome, and Edge.
 *
 * Usage:
 *   cy.get(el).should('have.cssCloseTo', 'top', 105.77, 1.5)
 *   cy.get(el).should('have.attrCloseTo', 'width', 255, 1.5)
 */
const DEFAULT_TOLERANCE = 1.5;

function parsePx(value) {
  return parseFloat(String(value).replace('px', ''));
}

chai.Assertion.addMethod('cssCloseTo', function (prop, expected, tol) {
  const tolerance = tol !== undefined ? tol : DEFAULT_TOLERANCE;
  const elem = this._obj[0] || this._obj;
  const raw = elem.ownerDocument.defaultView
    .getComputedStyle(elem)
    .getPropertyValue(prop);
  const actual = parsePx(raw);
  this.assert(
    Math.abs(actual - expected) <= tolerance,
    'expected #{this} CSS ' +
      prop +
      ' #{exp} but got #{act} ' +
      '(tolerance ' +
      tolerance +
      'px)',
    'expected #{this} CSS ' +
      prop +
      ' to not be close to #{exp}',
    expected + 'px',
    actual + 'px'
  );
});

chai.Assertion.addMethod('attrCloseTo', function (attr, expected, tol) {
  const tolerance = tol !== undefined ? tol : DEFAULT_TOLERANCE;
  const elem = this._obj[0] || this._obj;
  const raw = elem.getAttribute(attr);
  const actual = parsePx(raw);
  this.assert(
    Math.abs(actual - expected) <= tolerance,
    'expected #{this} attr ' +
      attr +
      ' #{exp} but got #{act} ' +
      '(tolerance ' +
      tolerance +
      'px)',
    'expected #{this} attr ' +
      attr +
      ' to not be close to #{exp}',
    expected + 'px',
    actual + 'px'
  );
});

Cypress.Commands.add('run', (name, opts) => {
  var saveto = (opts && "env" in opts) ? opts["env"] : name + "_" + Cypress._.random(0, 1e6);
  var argscli = (opts && "args" in opts) ? (' -arg '+opts["args"].join(' ')) : '';
  var seed = (opts && "seed" in opts) ? (' -seed '+opts["seed"]) : '';
  if (!opts || !("asyncrun" in opts) || !opts["asyncrun"])
      cy.exec(`python example/demo.py -port 8098 -testing -run ${name} -env ${saveto} ${seed} ${argscli}`);
  else
      cy.task('asyncrun', `python example/demo.py -testing -port 8098 -run ${name} -env ${saveto}` + seed + argscli)

  if (!opts || !("open" in opts) || opts["open"]) {
      cy.close_envs();
      cy.open_env(saveto);
  }
});

Cypress.Commands.add('close_envs', () => {
    cy.get('.rc-tree-select-selection__clear').click()
});

Cypress.Commands.add('open_env', (name) => {
    cy.get('.rc-tree-select').click()
    cy.get('.rc-tree-select-tree').then($tree => {
        var closed_group = '.rc-tree-select-tree-switcher_close'
        if ($tree.find(closed_group).length > 0)
            cy.get(closed_group).click()
    })
    cy.get('.rc-tree-select-tree').contains(name).click()
    cy.get('.rc-tree-select').click({force: true}) // ignore any elements that might cover the list at this point
});

