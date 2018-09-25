describe('Around page filtering and push state', function() {
    before(function(){
        cy.visit('/reports/Borsetshire');
        cy.contains('Borsetshire');
    });

    it('allows me to filter by report status', function() {
        cy.server();
        cy.route('/reports/Borsetshire\?ajax*').as('update-results');
        cy.contains('1 to 15 of 15');
        cy.get('.multi-select-button:first').click();
        cy.get('#status_0').click();
        cy.get('#status_1').click();
        cy.wait('@update-results');
        cy.contains('1 to 3 of 3');
        cy.contains('Full litter bins');
        cy.url().should('include', 'status=closed');
        cy.get('#status_2').click();
        cy.wait('@update-results');
        cy.contains('1 to 6 of 6');
        cy.contains('Street light not working');
        cy.url().should('include', 'status=closed%2Cfixed');
        cy.get('#status_2').should('be.checked');
        cy.go('back');
        cy.wait('@update-results');
        cy.contains('1 to 3 of 3');
        cy.should('not.contain', 'Street light not working');
        cy.url().should('not.include', 'fixed');
        cy.get('#status_2').should('not.be.checked');
      /* TODO: not sure this should work
        cy.go('forward');
        cy.wait('@update-results');
        cy.contains('1 to 6 of 6');
        cy.contains('Light not going off');
        cy.url().should('include', 'status=closed%2Cfixed');
        cy.get('#status_2').should('be.selected');
        */
    });

    it('allows me to filter by report category', function() {
        cy.server();
        cy.route('/reports/Borsetshire\?ajax*').as('update-results');
        cy.visit('/reports/Borsetshire');
        cy.contains('1 to 15 of 15');
        cy.get('.multi-select-button:eq(1)').click();
        cy.get('input[value=Potholes]').click();
        cy.wait('@update-results');
        cy.url().should('include', 'filter_category=Potholes');
        cy.contains('1 to 4 of 4');
        cy.contains('Large pothole');
        cy.get('input[value=Potholes]').click();
        cy.get('input[value=Other]').click();
        cy.wait('@update-results');
        cy.url().should('include', 'filter_category=Other');
        cy.contains('1 to 4 of 4');
        cy.contains('Loose drain cover');
        cy.should('not.contain', 'Large pothole');
      /* TODO: not sure this works
        cy.go('back');
        cy.wait('@update-results');
        cy.url().should('include', 'filter_category=Potholes');
        cy.contains('1 to 3 of 3');
        cy.contains('Large pothole');
        */
    });

    it('allows me to sort', function() {
        cy.server();
        cy.route('/reports/Borsetshire\?ajax*').as('update-results');
        cy.visit('/reports/Borsetshire');
        cy.contains('1 to 15 of 15');
        cy.get('#sort').select('created-desc');
        cy.url().should('include', 'sort=created-desc');
        cy.wait('@update-results');
        cy.get('.item-list__heading:first').contains('Flytipping on country lane');
        cy.get('#sort').select('created-asc');
        cy.wait('@update-results');
        cy.get('.item-list__heading:first').contains('Offensive graffiti');
        cy.get('#sort').select('updated-asc');
        cy.wait('@update-results');
        cy.get('.item-list__heading:first').contains('Faulty light');
        cy.get('#sort').select('updated-desc');
        cy.wait('@update-results');
        cy.get('.item-list__heading:first').contains('Pothole in cycle lane');
        cy.get('#sort').select('comments-desc');
        cy.wait('@update-results');
        cy.get('.item-list__heading').contains('Offensive graffiti');
    });

    it('lets me go from around -> report and back', function() {
        cy.server();
        cy.route('/report/*').as('show-report');
        cy.route('/reports/*').as('show-all');
        cy.visit('/reports/Borsetshire');
        // there is one pin extra for the background
        cy.get('image[id*="OpenLayers_Geometry_Point"]').should('have.length', 15);
        cy.get('image[title="Pothole in cycle lane"]').invoke('attr', 'xlink:href').should('not.contain', 'small');
        cy.get('.item-list--reports__item:first a').click();
        cy.wait('@show-report');
        cy.contains('Back to all reports');
        cy.get('image[id*="OpenLayers_Geometry_Point"]').should('have.length', 16);
        cy.get('image[title="Pothole in cycle lane"]').invoke('attr', 'xlink:href').should('contain', 'small');
        cy.contains('handlebars');
        cy.url().should('include', 'report');
        cy.go('back');
        cy.wait('@show-all');
        cy.contains('Lights out in tunnel');
        cy.should('not.contain', 'Back to all reports');
        cy.get('image[title="Pothole in cycle lane"]').invoke('attr', 'xlink:href').should('not.contain', 'small');
    });

    it('lets me click on a pin to show a report', function() {
        cy.server();
        cy.route('/report/*').as('show-report');
        cy.route('/reports/*').as('show-all');
        cy.route('/mapit/area/*').as('get-geometry');
        cy.visit('/reports/Borsetshire');
        cy.wait('@get-geometry');
        cy.get('image[title="Loose drain cover"]').invoke('attr', 'xlink:href').should('not.contain', 'small');
        cy.get('image[title="Loose drain cover"]').click();
        cy.wait('@show-report');
        cy.contains('Back to all reports');
        cy.get('image[title="Loose drain cover"]').invoke('attr', 'xlink:href').should('contain', 'small');
        cy.contains('tumble');
        cy.url().should('include', 'report');
        cy.go('back');
        cy.wait('@show-all');
        cy.contains('Lights out in tunnel');
        cy.should('not.contain', 'Back to all reports');
    });
});
