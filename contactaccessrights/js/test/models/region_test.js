define([
  'common/angularMocks',
  'access-rights/models/region'
], function () {
  'use strict';

  describe('Region', function () {
    var $provide, modelSpy, apiSpy;

    beforeEach(module('access-rights.models', function ($provide) {
      modelSpy = jasmine.createSpyObj('modelSpy', ['extend']);
      modelSpy.extend.and.returnValue({});
      apiSpy = jasmine.createSpyObj('apiSpy', ['query']);
      $provide.value('regionApi', apiSpy);
      $provide.value('Model', modelSpy);
    }));
    beforeEach(inject(function (Region) {}));

    it('calls modelSpy.extend with correct parameters', function () {
      expect(modelSpy.extend.calls.count()).toBe(1);
      expect(modelSpy.extend.calls.mostRecent().args.length).toBe(1);
      expect('getAll' in modelSpy.extend.calls.mostRecent().args[0]).toBeTruthy();
    });

    describe('getAll', function () {
      beforeEach(function(){
        modelSpy.extend.calls.mostRecent().args[0].getAll();
      });

      it('calls api.query', function () {
        expect(apiSpy.query.calls.count()).toBe(1);
      });
    });

  });
});
