/* globals inject */
/* eslint-env amd, jasmine */

define([
  'common/angular',
  'mocks/data/contract',
  'job-contract/app'
], function (angular, MockContract) {
  'use strict';

  describe('ContractLeaveService', function () {
    var $httpBackend, $rootScope, ContractLeaveService;

    beforeEach(module('hrjc'));

    beforeEach(inject(function (_ContractLeaveService_, _$httpBackend_, _$rootScope_) {
      ContractLeaveService = _ContractLeaveService_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;

      $httpBackend.whenGET(/action=get&entity=HRJobLeave/).respond(MockContract.contractLeaves);
      $httpBackend.whenGET(/views.*/).respond({});
    }));

    afterEach(function () {
      $httpBackend.flush();
      $rootScope.$apply();
    });

    describe('getOne()', function () {
      var contractLeaves;

      beforeEach(function () {
        contractLeaves = angular.copy(MockContract.contractLeaves.values)
        .map(function (contract) {
          contract.add_public_holidays = contract.add_public_holidays === '1';
          return contract;
        });
      });

      it('calls getOne() and returns expected contract leaves', function () {
        ContractLeaveService.getOne({ jobcontract_revision_id: 68 }).then(function (result) {
          expect(result).toEqual(contractLeaves);
        });
      });
    });
  });
});
