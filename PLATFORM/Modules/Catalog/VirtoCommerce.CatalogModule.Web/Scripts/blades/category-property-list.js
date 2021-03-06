﻿angular.module('virtoCommerce.catalogModule')
.controller('virtoCommerce.catalogModule.categoryPropertyListController', ['$scope', 'virtoCommerce.catalogModule.categories', 'virtoCommerce.catalogModule.properties', 'platformWebApp.bladeNavigationService', function ($scope, categories, properties, bladeNavigationService) {
    var blade = $scope.blade;
    blade.updatePermission = 'catalog:update';
    blade.origEntity = {};

    blade.refresh = function (parentRefresh) {
        categories.get({ id: blade.currentEntityId }, function (data) {
            initializeBlade(data);
            if (parentRefresh) {
                blade.parentBlade.refresh();
            }
        },
        function (error) { bladeNavigationService.setError('Error ' + error.status, blade); });
    };

    function initializeBlade(data) {
        if (data.properties) {
            var numberProps = _.where(data.properties, { valueType: 'Number', multivalue: false, dictionary: false });
            _.forEach(numberProps, function (prop) {
                _.forEach(prop.values, function (value) {
                    value.value = parseFloat(value.value);
                });
            });
        }

        blade.currentEntity = angular.copy(data);
        blade.origEntity = data;
        blade.title = data.name;
        blade.isLoading = false;
    }

    function isDirty() {
        return !angular.equals(blade.currentEntity, blade.origEntity) && blade.hasUpdatePermission();
    }

    function canSave() {
        return isDirty() && formScope && formScope.$valid;
    }

    function saveChanges() {
        blade.isLoading = true;
        categories.update({}, blade.currentEntity, function (data, headers) {
            blade.refresh(true);
        },
        function (error) { bladeNavigationService.setError('Error ' + error.status, blade); });
    };

    blade.onClose = function (closeCallback) {
        bladeNavigationService.showConfirmationIfNeeded(isDirty(), canSave(), blade, saveChanges, closeCallback, "catalog.dialogs.category-save.title", "catalog.dialogs.category-save.message");
    };

    $scope.editProperty = function (prop) {
        var newBlade = {
            id: 'editCategoryProperty',
            currentEntityId: prop.id,
            title: 'catalog.blades.property-detail.title-category',
            subtitle: 'catalog.blades.property-detail.subtitle-category',
            controller: 'virtoCommerce.catalogModule.propertyDetailController',
            template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/property-detail.tpl.html'
        };

        bladeNavigationService.showBlade(newBlade, blade);
    };

    $scope.getPropValues = function (propId, keyword) {
        return properties.values({ propertyId: propId, keyword: keyword }).$promise.then(function (result) {
            return result;
        });
    };

    var formScope;
    $scope.setForm = function (form) {
        formScope = form;
    }

    blade.toolbarCommands = [
		{
		    name: "platform.commands.save", icon: 'fa fa-save',
		    executeMethod: function () {
		        saveChanges();
		    },
		    canExecuteMethod: canSave,
		    permission: blade.updatePermission
		},
        {
            name: "platform.commands.reset", icon: 'fa fa-undo',
            executeMethod: function () {
                angular.copy(blade.origEntity, blade.currentEntity);
            },
            canExecuteMethod: isDirty,
            permission: blade.updatePermission
        },
		  {
		      name: "catalog.commands.add-property", icon: 'fa fa-plus',
		      executeMethod: function () {
		          var newBlade = {
		              id: 'editCategoryProperty',
		              categoryId: blade.currentEntity.id,
		              title: 'catalog.blades.property-detail.title-category-new',
		              subtitle: 'catalog.blades.property-detail.subtitle-category-new',
		              controller: 'virtoCommerce.catalogModule.propertyDetailController',
		              template: 'Modules/$(VirtoCommerce.Catalog)/Scripts/blades/property-detail.tpl.html'
		          };

		          bladeNavigationService.showBlade(newBlade, blade);
		      },
		      canExecuteMethod: function () {
		          return true;
		      },
		      permission: blade.updatePermission
		  }
    ];

    if (blade.currentEntity) {
        initializeBlade(angular.copy(blade.currentEntity));
    } else {
        blade.refresh();
    }
}]);
