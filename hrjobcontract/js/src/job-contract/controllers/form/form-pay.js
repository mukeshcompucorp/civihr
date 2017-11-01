/* eslint-env amd */

define([
  'job-contract/controllers/controllers'
], function (controllers) {
  'use strict';

  controllers.controller('FormPayCtrl', ['$log', '$filter', '$scope', 'settings', 'FormatCurrencyService',
    function ($log, $filter, $scope, settings, FormatCurrencyService) {
      $log.debug('Controller: FormPayCtrl');

      var calcBenefitsPerCycleNet = 0;
      var calcPayAnnualizedEst = 0;
      var calcPayPerCycleGross = 0;
      var entityPay = $scope.entity.pay || {};
      var utilsPayScaleGrade = $scope.utils.payScaleGrade;
      var defaults = {
        pay_amount: 0,
        pay_currency: settings.CRM.defaultCurrency,
        pay_cycle: '2',
        pay_unit: 'Year'
      };
      var workPerYear = {
        Year: 1,
        Month: 12,
        Bimonthly: 24,
        Week: 52,
        Biweekly: 104,
        Fortnight: 26,
        Day: 260,
        Hour: 2080
      };

      entityPay.is_paid = entityPay.is_paid || 0;
      entityPay.pay_is_auto_est = '0';
      entityPay.annual_benefits = entityPay.annual_benefits || [];
      entityPay.annual_deductions = entityPay.annual_deductions || [];

      $scope.collapseBenDed = !entityPay.annual_benefits.length && !entityPay.annual_deductions.length;
      $scope.benefits_per_cycle = (0).toFixed(2);
      $scope.benefits_per_cycle_net = 0;
      $scope.deductions_per_cycle = (0).toFixed(2);

      /**
       * Display formatted pay amount in field as per the settings
       */
      function formatPayAmount () {
        FormatCurrencyService.format(entityPay.pay_amount).then(function (amount) {
          entityPay.pay_amount = amount.formatted;
        });
      }

      function getCycles () {
        var cycles = 1;

        switch (+entityPay.pay_cycle) {
          case 1:
            cycles = workPerYear.Week;
            break;
          case 2:
            cycles = workPerYear.Month;
            break;
          case 3:
            cycles = workPerYear.Biweekly;
            break;
          case 4:
            cycles = workPerYear.Bimonthly;
            break;
        }

        return cycles;
      }

      $scope.add = function (array) {
        array.push({
          'name': '',
          'type': '',
          'amount_pct': '',
          'amount_abs': ''
        });
      };

      $scope.applyPayScaleGradeData = function () {
        if (entityPay.pay_scale) {
          var payScaleGrade = $filter('getObjById')(utilsPayScaleGrade, entityPay.pay_scale);
          entityPay.pay_amount = payScaleGrade.amount || defaults.pay_amount;
          entityPay.pay_currency = payScaleGrade.currency || defaults.pay_currency;
          entityPay.pay_unit = payScaleGrade.pay_frequency || defaults.pay_unit;
        }
      };

      $scope.calcAnnualPayEst = function () {
        if (+entityPay.is_paid) {
          FormatCurrencyService.format(entityPay.pay_amount).then(function (amount) {
            calcPayAnnualizedEst = ((+amount.parsed) * (workPerYear[entityPay.pay_unit] || 0)).toFixed(2);
            entityPay.pay_annualized_est = amount.formatted;
          });
        }
      };

      $scope.calcBenefitsPerCycle = function () {
        if (+entityPay.is_paid) {
          var i = 0;
          var len = entityPay.annual_benefits.length;
          var annualBenefits = 0;

          for (i; i < len; i++) {
            if (+entityPay.annual_benefits[i].type === 2) {
              entityPay.annual_benefits[i].amount_abs = (entityPay.annual_benefits[i].amount_pct / 100 * calcPayAnnualizedEst).toFixed(2);
            }

            annualBenefits += +entityPay.annual_benefits[i].amount_abs;
          }
          $scope.benefits_per_cycle = (annualBenefits / getCycles()).toFixed(2);
        }
      };

      $scope.calcBenefitsPerCycleNet = function () {
        if (+entityPay.is_paid) {
          calcBenefitsPerCycleNet = ($scope.benefits_per_cycle - $scope.deductions_per_cycle);

          FormatCurrencyService.format(calcBenefitsPerCycleNet).then(function (amount) {
            entityPay.benefits_per_cycle_net = amount.formatted;
          });
        }
      };

      $scope.calcDeductionsPerCycle = function () {
        if (+entityPay.is_paid) {
          var i = 0;
          var len = entityPay.annual_deductions.length;
          var annualDeductions = 0;

          for (i; i < len; i++) {
            if (+entityPay.annual_deductions[i].type === 2) {
              entityPay.annual_deductions[i].amount_abs = (entityPay.annual_deductions[i].amount_pct / 100 * calcPayAnnualizedEst).toFixed(2);
            }

            annualDeductions += +entityPay.annual_deductions[i].amount_abs;
          }
          $scope.deductions_per_cycle = (annualDeductions / getCycles()).toFixed(2);
        }
      };

      $scope.calcPayPerCycleGross = function () {
        if (+entityPay.is_paid) {
          calcPayPerCycleGross = (calcPayAnnualizedEst / getCycles()).toFixed(2);

          FormatCurrencyService.format(calcPayPerCycleGross).then(function (amount) {
            entityPay.pay_per_cycle_gross = amount.formatted;
          });
        }
      };

      $scope.calcPayPerCycleNet = function () {
        if (+entityPay.is_paid) {
          var calcPayPerCycleNet = (+calcPayPerCycleGross + +calcBenefitsPerCycleNet).toFixed(2);
          FormatCurrencyService.format(calcPayPerCycleNet).then(function (amount) {
            entityPay.pay_per_cycle_net = amount.formatted;
          });
        }
      };

      $scope.resetData = function () {
        entityPay.pay_scale = '';
        entityPay.pay_amount = '';
        entityPay.pay_unit = '';
        entityPay.pay_currency = '';
        entityPay.pay_annualized_est = '';
        entityPay.pay_is_auto_est = '';
        entityPay.annual_benefits = [];
        entityPay.annual_deductions = [];
        entityPay.pay_cycle = '';
        entityPay.pay_per_cycle_gross = '';
        entityPay.pay_per_cycle_net = '';
        $scope.benefits_per_cycle = '';
        $scope.deductions_per_cycle = '';
      };

      $scope.setDefaults = function () {
        entityPay.pay_cycle = defaults.pay_cycle;
        entityPay.pay_currency = defaults.pay_currency;
        entityPay.pay_is_auto_est = '0';
        entityPay.pay_amount = (0).toFixed(2);
      };

      $scope.remove = function (array, index) {
        array.splice(index, 1);
      };

      $scope.$watch('entity.pay.pay_amount', function () {
        $scope.calcAnnualPayEst();
        formatPayAmount();
      });
      $scope.$watch('entity.pay.pay_unit', $scope.calcAnnualPayEst);
      $scope.$watch('entity.pay.pay_annualized_est', function () {
        $scope.calcPayPerCycleGross();
        $scope.calcBenefitsPerCycle();
        $scope.calcDeductionsPerCycle();
      });
      $scope.$watch('entity.pay.annual_benefits', $scope.calcBenefitsPerCycle, true);
      $scope.$watch('entity.pay.annual_deductions', $scope.calcDeductionsPerCycle, true);
      $scope.$watch('benefits_per_cycle', $scope.calcBenefitsPerCycleNet);
      $scope.$watch('deductions_per_cycle', $scope.calcBenefitsPerCycleNet);
      $scope.$watch('benefits_per_cycle_net', $scope.calcPayPerCycleNet);
      $scope.$watch('entity.pay.pay_per_cycle_gross', $scope.calcPayPerCycleNet);
    }
  ]);
});
