(function () {

    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.io/#x15.4.4.18
    if (!Array.prototype.forEach) {

      Array.prototype.forEach = function(callback, thisArg) {

        var T, k;

        if (this == null) {
          throw new TypeError(' this is null or not defined');
        }

        // 1. Let O be the result of calling toObject() passing the
        // |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get() internal
        // method of O with the argument "length".
        // 3. Let len be toUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If isCallable(callback) is false, throw a TypeError exception. 
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
          throw new TypeError(callback + ' is not a function');
        }

        // 5. If thisArg was supplied, let T be thisArg; else let
        // T be undefined.
        if (arguments.length > 1) {
          T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while (k < len) {

          var kValue;

          // a. Let Pk be ToString(k).
          //    This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty
          //    internal method of O with argument Pk.
          //    This step can be combined with c
          // c. If kPresent is true, then
          if (k in O) {

            // i. Let kValue be the result of calling the Get internal
            // method of O with argument Pk.
            kValue = O[k];

            // ii. Call the Call internal method of callback with T as
            // the this value and argument list containing kValue, k, and O.
            callback.call(T, kValue, k, O);
          }
          // d. Increase k by 1.
          k++;
        }
        // 8. return undefined
      };
    };

    // Grid columns cannot be smaller than this fixed width
    var minColumnWidth = 50;

    // Grid Module
    angular.module('crm.grid', ['crm.grid.helpers'])
        // Cache the html templates
    .run(['$templateCache', function ($templateCache) {
        $templateCache.put("crm.grid", "<div class=\"crm-grid\" data-ng-class=\"{\'crm-grid-lines-off\': !api.grid.hasGridLines()}\">\r\n    <div data-ng-show=\"hasRenderCols()\" class=\"crm-grid-col-resize-tracker ngHide\"></div>\r\n    <div data-ng-show=\"hasRenderCols()\" class=\"crm-grid-col-headers-container crm-grid-gradient\" style=\"width: 100%;overflow:hidden;\">\r\n        <div data-ng-show=\"viewWindowFixedCols.getBlocks() && viewWindowFixedCols.getBlocks().length\" class=\"crm-grid-fixed-col-headers-inner\" style=\"position:absolute;\" data-ng-style=\"{width: viewWindowFixedCols.getContentSize()}\">\r\n            <div class=\"crm-grid-col-header crm-grid-gradient\"\r\n                 data-crm-grid-col-header-fixed=\"\"\r\n                 data-index=\"{{col.getIndex()}}\"\r\n                 data-ng-repeat=\"col in viewWindowFixedCols.getBlocks() track by $index\"\r\n                 data-ng-style=\"{width: col.getSize() + \'px\'}\"\r\n                 style=\"position:relative;float:left;\">\r\n            </div>\r\n        </div>\r\n        <div class=\"crm-grid-col-headers-inner\" style=\"position:relative;\" data-ng-style=\"{width: viewWindowCols.getContentSize() + \'px\'}\">\r\n            <div class=\"crm-grid-col-header crm-grid-gradient\"\r\n                 data-crm-grid-col-header=\"\"\r\n                 data-index=\"{{col.getIndex()}}\"\r\n                 data-ng-repeat=\"col in viewWindowCols.renderedData track by $index\"\r\n                 data-ng-style=\"{width: col.getSize() + \'px\'}\"\r\n                 style=\"position:relative;float:left;\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"crm-grid-viewport-container\" style=\"width:100%;height:100%;position:relative;overflow:hidden;\">\r\n        <!-- Render rows with the fixed cols -->\r\n        <div data-ng-if=\"api.grid.isColumnsVisible()\"\r\n             data-ng-show=\"viewWindowFixedCols.getBlocks() && viewWindowFixedCols.getBlocks().length\"\r\n             class=\"crm-fixed-cols-container\"\r\n             data-ng-style=\"{width: viewWindowFixedCols.getContentSize() + \'px\'}\"\r\n             style=\"position:absolute;\">\r\n            <div data-crm-grid-row-fixed=\"\"\r\n                 data-ng-repeat=\"row in viewWindowRows.renderedData track by $index\"\r\n                 class=\"renderedRow crm-grid-row crm-fixed-col-row\"\r\n                 data-ng-class=\"{odd: (row.getAbsoluteIndex() + 1) % 2 == 1, even: (row.getAbsoluteIndex() + 1) % 2 == 0, selected: isSelected()}\"\r\n                 data-index=\"{{row.getAbsoluteIndex()}}\"\r\n                 style=\"position: absolute;width:100%;\"\r\n                 data-ng-style=\"{top: row.getAbsolutePos() + \'px\', height: row.getSize() + \'px\'}\">\r\n\r\n            </div>\r\n        </div>\r\n        <div class=\"crm-grid-viewport\" data-ng-class=\"{\'fixed-col-viewport\': viewWindowFixedCols.getBlocks() && viewWindowFixedCols.getBlocks().length && hasRenderCols()}\" style=\"width:100%;height:100%;overflow:auto\">\r\n            <div class=\"crm-grid-scroll-container\" data-ng-style=\"{\'min-width\': !hasRenderCols() ? minWidth + \'px\' : undefined }\" style=\"overflow:hidden;height:100%; top: 0px; position: relative;\">\r\n                <div class=\"main-inbox-content\" style=\"height:100%;\">\r\n                    <div data-ng-if=\"!hasRenderCols() && !isColumnsVisible() && api.grid.getData()\"\r\n                         data-crm-grid-row=\"\"\r\n                         data-ng-repeat=\"row in viewWindowRows.renderedData track by $index\"\r\n                         class=\"renderedRow crm-grid-row\"\r\n                         data-ng-class=\"{odd: (row.getAbsoluteIndex() + 1) % 2 == 1, even: (row.getAbsoluteIndex() + 1) % 2 == 0, selected: isSelected()}\"\r\n                         data-index=\"{{row.getAbsoluteIndex()}}\"\r\n                         style=\"position: absolute; width: 100%;\"\r\n                         data-ng-style=\"{top: row.getAbsolutePos() + \'px\', height: row.getSize() + \'px\'}\">\r\n\r\n                    </div>\r\n\r\n                    <div data-ng-if=\"api.grid.getData() && hasRenderCols()\"\r\n                         data-ng-repeat=\"row in viewWindowRows.renderedData track by $index\"\r\n                         data-crm-grid-row=\"\"\r\n                         class=\"renderedRow crm-grid-row\"\r\n                         data-index=\"{{row.getAbsoluteIndex()}}\"\r\n                         data-ng-class=\"{odd: (row.getAbsoluteIndex() + 1) % 2 == 1, even: (row.getAbsoluteIndex() + 1) % 2 == 0, selected: isSelected()}\"\r\n                         style=\"position: absolute; width: 100%;\"\r\n                         data-ng-style=\"{top: row.getAbsolutePos() + \'px\', height: row.getSize() + \'px\'}\">\r\n\r\n                    </div>\r\n\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n<div class=\"crm-grid-pager\" data-crm-grid-pager-control=\"\" data-pager-model=\"pager\" data-on-register=\"onPagerRegister\"></div></div>");
        $templateCache.put('crm.grid.cell', '<div class="crm-grid-cell" data-crm-grid-cell="" data-index="{{col.getIndex()}}" data-ng-repeat="col in viewWindowCols.renderedData track by $index" data-ng-style="{width: col.getSize() + \'px\', left: col.getAbsolutePos() + \'px\', height: row.getSize() + \'px\'}" style="position:absolute;"></div>');
        $templateCache.put('crm.grid.fixed.cell', '<div class="crm-grid-cell" data-crm-grid-cell="" data-index="{{$index}}" data-ng-repeat="col in viewWindowFixedCols.getBlocks() track by $index" data-ng-style="{width: col.getSize() + \'px\', left: col.getAbsolutePos() + \'px\', height: row.getSize() + \'px\'}" style="position:absolute;"></div>');
        $templateCache.put('crm.grid.pager', '<div class="pager-contents" data-ng-if="pagerModel.getNumberOfPages() > 0">\r\n    <a ng-class="{disabled: pagerModel.isAtStart()}" class="previous" href="javascript:void(0)" ng-click="previousPage()">&lt; Previous</a>\r\n    <a ng-class="{disabled: pagerModel.isAtEnd()}" class="next" href="javascript:void(0)" ng-click="nextPage()">Next &gt;</a>\r\n    <div class="page-numbers">\r\n        <a ng-class="{disabled: pagerModel.getPage() == 1}" class="page-number"\r\n           href="javascript:void(0);" ng-click="goToPage(1)">\r\n            1\r\n        </a>\r\n        <span data-ng-if="pagerModel.isPastHalf() && pagerModel.isLeftFirstValid()">...</span>\r\n        <a ng-class="{disabled: pagerModel.getPage() == number}" class="page-number"\r\n           data-ng-repeat="number in pagerModel.getLeftNumbers()"\r\n           href="javascript:void(0);" ng-click="goToPage(number)">\r\n            {{number | number}}\r\n        </a>\r\n        <!-- Show the current number (number between the left and right) as long as it is not the last number -->\r\n        <span data-ng-if="pagerModel.isPastHalf() && pagerModel.isPageCountLimited() && pagerModel.getPage() != pagerModel.getNumberOfPages()" class="page-number">{{pagerModel.getPage() | number}}</span>\r\n        <a ng-class="{disabled: pagerModel.getPage() == number}" class="page-number"\r\n           data-ng-repeat="number in pagerModel.getRightNumbers()"\r\n           href="javascript:void(0);" ng-click="goToPage(number)">\r\n            {{number | number}}\r\n        </a>\r\n\r\n        <!-- Right ellipsis -->\r\n        <span data-ng-if="pagerModel.isPageCountLimited() && pagerModel.isNotNearEnd()">...</span>\r\n\r\n        <!-- The last number -->\r\n        <a data-ng-class="{disabled: pagerModel.getPage() == pagerModel.getNumberOfPages()}" class="page-number"\r\n           href="javascript:void(0);"\r\n           data-ng-if="pagerModel.getNumberOfPages() > 1"\r\n           ng-click="goToPage(pagerModel.getNumberOfPages())">\r\n            {{pagerModel.getNumberOfPages() | number}}\r\n        </a>\r\n    </div>\r\n\r\n\r\n</div>');
    }])
        // The pager control
    .directive('crmGridPagerControl', ['$templateCache', function ($templateCache) {
        return {
            scope: {
                pagerModel: '=',
                onRegister: '='
            },
            require: '^crmGrid',
            link: function (scope, element, attrs, controllerGrid) {
                // Expose the pager api
                controllerGrid.api.pager = {
                    nextPage: function () { return scope.nextPage(); },
                    previousPage: function () { return scope.previousPage(); },
                    goToPage: function (p) { return scope.goToPage(p); },
                    resetPage: function () { return scope.resetPage(); },
                    setLimit: function (l) { return scope.setLimit(l); },
                    getLimit: function () { return scope.getLimit(); },
                    getPage: function () { return scope.getPage(); }
                };

                if (scope.onRegister) {
                    scope.onRegister(controllerGrid.api.pager);
                }

                // Resize the viewer when the pager is created
                //controllerGrid.api.grid.resizeViewport();
            },
            controller: function ($scope) {
                $scope.nextPage = function () {
                    if (!$scope.pagerModel.isAtEnd()) {
                        $scope.pagerModel.goToNext();
                        var datasource = $scope.pagerModel.getDataSource();
                        if (datasource) {
                            return datasource.doRequest({ pager: $scope.pagerModel });
                        }
                    }
                };

                $scope.previousPage = function () {
                    if (!$scope.pagerModel.isAtStart()) {
                        $scope.pagerModel.goToPrevious();
                        var datasource = $scope.pagerModel.getDataSource();
                        if (datasource) {
                            return datasource.doRequest({ pager: $scope.pagerModel });
                        }
                    }
                };

                $scope.goToPage = function (page) {
                    if (page != $scope.pagerModel.getPage()) {
                        $scope.pagerModel.goToPage(page);
                        var datasource = $scope.pagerModel.getDataSource();
                        if (datasource) {
                            return datasource.doRequest({ pager: $scope.pagerModel });
                        }
                    }
                };

                $scope.resetPage = function () {
                    return $scope.goToPage(1);
                };

                // Sets the limit per page - The set limit for the dropdown selection
                $scope.setLimit = function (limit) {
                    var oldLimit = $scope.pagerModel.getLimit();
                    $scope.pagerModel.setLimitReset(limit);
                    var total = $scope.pagerModel.getTotal();
                    //cookies.set(cookieLimitKey, limit, new Date(cookies.getExpDate()));

                    var datasource = $scope.pagerModel.getDataSource();
                    // if the limit is too small to support the total refresh (The limit can only support a small set of rows)
                    // Also refresh if the total rows are greater than it's old limit, but less than the new limit (the limit can support more rows)
                    if (datasource && (total >= limit || (total > oldLimit && oldLimit < limit))) {
                        return datasource.doRequest({ pager: $scope.pagerModel });
                    }
                };

                $scope.getLimit = function () {
                    var limit;
                    if ($scope.pagerModel) {
                        limit = $scope.pagerModel.getLimit();
                    }
                    return limit;
                };

                $scope.getPage = function () {
                    var page;
                    if ($scope.pagerModel) {
                        page = $scope.pagerModel.getPage();
                    }
                    return page;
                };

                if ($scope.pagerModel && $scope.pagerModel.getDataSource()) {
                    $scope.$watch('pagerModel.getDataSource().getDataTotal()', function () {
                        $scope.pagerModel.setTotal($scope.pagerModel.getDataSource().getDataTotal());
                    });
                    $scope.$watch('pagerModel.getDataSource().getLimit()', function () {
                        $scope.pagerModel.setLimit($scope.pagerModel.getDataSource().getLimit());
                    });
                    $scope.$watch('pagerModel.getDataSource().getPage()', function () {
                        $scope.pagerModel.goToPage($scope.pagerModel.getDataSource().getPage());
                    });
                }
            },
            template: $templateCache.get('crm.grid.pager')
        };
    }])

    // Helpers Module
    angular.module('crm.grid.helpers', [])
    .factory('crmGridEvent', [function () {
        function convertName(name){
            return (name || '').toString().toLocaleLowerCase()
        }

        return {
            create: function (opts) {
                var eventMap = {};
                return {
                    trigger: function (name, data) {
                        name = convertName(name);
                        var arr = eventMap[name];

                        if (arr && arr.length) {
                            for (var i = 0; i < arr.length; i++) {
                                arr[i](data);
                            }
                        }
                    },
                    on: function (name, fn) {
                        name = convertName(name);
                        if (!eventMap[name]) {
                            eventMap[name] = [];
                        }
                        
                        // Add the callback only if one is passed in
                        if (fn) {
                            var index = eventMap[name].indexOf(fn);
                            if (index == -1) {
                                eventMap[name].push(fn);
                            }
                        }
                        
                        return fn;
                    },
                    off: function (name, fn) {
                        name = convertName(name);
                        if (!fn) {
                            eventMap[name] = [];
                        }
                        else {
                            var arr = eventMap[name];
                            if (arr && arr.length) {
                                var index = arr.indexOf(fn);
                                if (index > -1) {
                                    arr.slice(index, 1);
                                }
                            }
                        }
                    }
                };
            }
        };
    }])
    .factory('crmGridPager', [function () {
        // The defaults for each pager object
        var defStart = 1;
        var defLimit = 250;
        var defTotal = 0;
        var defLastPage = 1;
        var minStart = 1;

        function Pager(start, limit, total) {
            this._start;
            this._limit;
            this._total;
            this._datasource;
            this._leftNumbers = [];
            this._rightNumbers = [];
            this._halfPoint;
            setStart(this, start);
            setLimit(this, limit);
            setTotal(this, total);

            this._page = this._start;
            this._lastPageShown;
            this.setLastPage(5);
        }

        Pager.prototype.getDataSource = function () {
            return this._datasource;
        };

        Pager.prototype.setDataSource = function (s) {
            this._datasource = s;
        };

        // Helps determine if the left ellipsis should be shown
        Pager.prototype.isLeftFirstValid = function () {
            var left = this.getLeftNumbers();

            return left.length > 0 && left[0] > minStart + 1;
        };

        // Helps determine if the right ellipsis should be shown
        Pager.prototype.isNotNearEnd = function () {
            var right = this.getRightNumbers();
            var length = right.length;
            var left = this.getLeftNumbers();

            return this.getPage() + length + 1 < this.getNumberOfPages() && this.getLastPage() + 1 != this.getNumberOfPages();
        };

        // Calculates the left and right numbers based on the current page
        Pager.prototype.calcPager = function () {
            this._leftNumbers = [];
            this._rightNumbers = [];

            // Make sure the current page is not bigger than the number of pages
            var maxPage = this.getNumberOfPages();
            if (this._page > maxPage) {
                setCurrentPage(this, maxPage);
            }

            if (this.isPageCountLimited()) {

                if (this.isPastHalf()) {

                    var numsToAdd = (this._halfPoint - 1);

                    var p = this._page;
                    var endNumber = p + numsToAdd; // must be less total
                    var startNumber = p - numsToAdd; // must be greater 1

                    startNumber = startNumber > 1 ? startNumber : p;
                    endNumber = endNumber >= this.getNumberOfPages() ? this.getNumberOfPages() - 1 : endNumber;

                    // Right numbers
                    for (var i = p + 1; i <= endNumber; i++) {
                        this._rightNumbers.push(i);
                    }

                    // Left numbers
                    for (var i = startNumber; i < p; i++) {
                        this._leftNumbers.push(i);
                    }
                }
                else {
                    // second page all the way to the last page displayed
                    for (var i = 2; i <= this.getLastPage() ; i++) {
                        this._leftNumbers.push(i);
                    }
                }
            }
            else {

                // Push all, but the first and last
                for (var i = 2; i < this.getNumberOfPages() ; i++) {
                    this._leftNumbers.push(i);
                }
            }
        };

        // Sets the total number of records
        Pager.prototype.setTotal = function (total) {
            setTotal(this, total);
            this.calcPager();
        };

        // Gets total number of records
        Pager.prototype.getTotal = function (total) {
            return this._total;
        };

        // Gets the initial start page
        Pager.prototype.getStart = function () {
            return this._start;
        };

        // Gets the current page
        Pager.prototype.getPage = function () {
            return this._page;
        };

        Pager.prototype.resetPage = function () {
            this.goToPage(this.getStart());
        };

        // Jumps to a page that is within range
        Pager.prototype.goToPage = function (page) {
            var pageNew = page || defStart;

            if (pageNew >= minStart && pageNew <= this.getNumberOfPages()) {
                this._page = pageNew;
            }

            this.calcPager();
        };

        Pager.prototype.getStartRecord = function () {
            return (this.getPage() - 1) * this.getLimit() + 1;
        }

        // This really returns whether the current page is past half.
        Pager.prototype.isAtHalf = function () {
            //return this.getPage() - 1 > this._halfPoint;
            //return this.getPage() + 1 >= this.getLastPage();
            return this.getPage() == this._halfPoint;
        };

        Pager.prototype.isPastHalf = function () {
            return this.getPage() > this._halfPoint;
        };

        Pager.prototype.getLeftNumbers = function () {
            return this._leftNumbers;
        };

        Pager.prototype.getRightNumbers = function () {
            return this._rightNumbers;
        };

        // Goes to the previous page
        Pager.prototype.goToPrevious = function () {
            this.goToPage(this._page - 1);
        };

        // Goes to the next page
        Pager.prototype.goToNext = function () {
            this.goToPage(this._page + 1);
        };

        // Sets the last page that should be displayed
        Pager.prototype.setLastPage = function (page) {
            this._lastPageShown = page || defLastPage;
            // Go to the highest. This works with odd numbers only
            this._halfPoint = Math.ceil(this._lastPageShown / 2);
        };

        // The max number of pages that should be displayed from the left starting
        Pager.prototype.getLastPage = function () {
            return this._lastPageShown;
        };

        // Total number of pages
        Pager.prototype.getNumberOfPages = function () {
            return Math.ceil(this._total / this._limit);
        };

        // Determines if the number of pages to display should be limited
        Pager.prototype.isPageCountLimited = function () {
            return this.getNumberOfPages() > this.getLastPage()
        };

        // Determines if the current page is the start page
        Pager.prototype.isAtStart = function () {
            return this._page == 1;
        };

        // Determines if the current page is the end page
        Pager.prototype.isAtEnd = function () {
            return this._page == this.getNumberOfPages();
        };

        // Sets the limit per page
        Pager.prototype.setLimit = function (limit) {
            setLimit(this, limit);
            this.calcPager();
        };

        Pager.prototype.setLimitReset = function (limit) {
            this._page = 1;
            this.setLimit(limit);
        };

        // Gets the limit per page
        Pager.prototype.getLimit = function () {
            return this._limit;
        };

        // ----- Pager Utility Functions ----- //
        function setPage(pager, key, page) {
            pager[key] = page || defStart;

            if (pager[key] < defStart) {
                pager[key] = defStart;
            }
        }

        function setStart(pager, start) {
            setPage(pager, '_start', start);
            if (pager.getDataSource()) {
                pager.getDataSource().setStart(pager.getStartRecord());
            }
        }

        function setCurrentPage(pager, page) {
            setPage(pager, '_page', page);
        }

        function setLimit(pager, limit) {
            pager._limit = limit || defLimit;
            pager._limit = pager._limit <= 0 ? defLimit : pager._limit;

            if (pager.getDataSource()) {
                pager.getDataSource().setLimit(pager.getLimit());
            }
        }

        function setTotal(pager, total) {
            pager._total = total || defTotal;
            pager._total = pager._total < 0 ? defTotal : pager._total;

            if (pager.getDataSource()) {
                pager.getDataSource().setDataTotal(pager.getTotal());
            }
        }

        return {
            create: function (start, limit, total) {
                return new Pager(start, limit, total);
            }
        };
    }])
    .factory('crmGridDataSource', ['$http', 'crmGridEvent', function ($http, crmGridEvent) {
        return function (opts) {
            opts = opts || {};

            var eventManager = crmGridEvent.create();

            // The private variables
            var requestCallback = opts.requestCallback;
            var preRequestCallback = opts.preRequestCallback;
            var requestObject;
            var transformData = opts.transformData || function (datasource, data) { return data; };
            var dataSourceData = {};
            var userRequestData = {};
            var userRequestParams = {};
            var requestDataCon;
            var requestParamsCon;
            var dataSourceTotal = 0;
            var requestOverride;
            var requestDataAppend;
            var requestParamsAppend;
            var pagerRequestOpts;
            var preRequest = opts.preRequest || function () { };

            // If there is no request callback and there is a request object save the request
            if (!opts.requestOverride && opts.request) {
                // private request object variables
                var privRequestProps = {
                    method: opts.request.method,
                    url: opts.request.url,
                    headers: opts.request.headers,
                    dataFormatter: opts.request.dataFormatter,
                    paramsFormatter: opts.request.paramsFormatter,
                    pagerCallback: opts.request.pagerCallback
                };

                pagerRequestOpts = angular.copy(opts.request.pager || {});

                // The request data and parameters
                if (opts.request.data) {
                    requestDataCon = angular.copy(opts.request.data);
                    requestDataAppend = opts.request.dataAppend;
                }

                if (opts.request.params) {
                    requestParamsCon = angular.copy(opts.request.params);
                    requestParamsAppend = opts.request.parametersAppend;
                }

                requestObject = {
                    getMethod: function () {
                        return privRequestProps.method;
                    },
                    getUrl: function () {
                        return privRequestProps.url;
                    },
                    getHeaders: function () {
                        return privRequestProps.headers;
                    }
                };
            }
            else if (opts.requestOverride) {
                requestOverride = {
                    callback: opts.requestOverride.callback,
                    pagerCallback: opts.requestOverride.pagerCallback
                };
            }

            // Utility functions
            function getDeepValue(str, obj) {
                var curObj;
                if (str) {
                    curObj = obj;
                    str = str.split('.');
                    for (var i = 0; i < str.length; i++) {
                        curObj = curObj[str[i]];
                    }
                }

                return curObj;
            }

            function setDeepValue(str, val, obj) {
                var curObj;
                if (str) {
                    curObj = obj;
                    var objToSet;
                    str = str.split('.');
                    for (var i = 0; i < str.length; i++) {
                        objToSet = curObj;
                        curObj = curObj[str[i]];
                    }

                    // Set the value to the specified object key if the object exist
                    if (objToSet) {
                        objToSet[str[str.length - 1]] = val;
                    }
                }

                return curObj;
            }

            return {
                cloneRequestOptions: function () {
                    var requestObj = this.getRequest();
                    return {
                        method: requestObj.getMethod(),
                        url: requestObj.getUrl(),
                        headers: requestObj.getHeaders(),
                        data: this.cloneRequestData(),
                        params: this.cloneRequestParameters()
                    };
                },
                addEvent: function(name, fn){
                    return eventManager.on(name, fn);
                },
                removeEvent: function(name, fn){
                    eventManager.off(name, fn);
                },
                doRequest: function (newData, append) {
                    preRequest(this);
                    var request;
                    eventManager.trigger('crm.grid.datasource.beforeLoad');
                    var requestObj = this.getRequest();
                    if (requestObj) {
                        // The set up for calling to the server
                        var requestOpts = {
                            method: requestObj.getMethod(),
                            url: requestObj.getUrl(),
                            headers: requestObj.getHeaders()
                        };

                        // Updates the request data and parameters passed on the passed in object
                        if (newData) {
                            if (newData.requestData) {
                                this.setRequestData(newData.requestData);
                            }

                            if (newData.requestParameters) {
                                this.setRequestParameters(newData.requestParameters);
                            }

                            if (newData.pager && pagerRequestOpts) {

                                this.setLimit(newData.pager.getLimit());
                                this.setStart(newData.pager.getStartRecord());
                            }
                        }

                        // Collect the request data and parameters
                        var finalRequestData = this.cloneRequestData();
                        var finalRequestParams = this.cloneRequestParameters();
                        requestOpts.data = privRequestProps.dataFormatter ? privRequestProps.dataFormatter(finalRequestData) : finalRequestData;
                        requestOpts.params = privRequestProps.paramsFormatter ? privRequestProps.paramsFormatter(finalRequestParams) : finalRequestParams;

                        // Perform the server call
                        request = $http(requestOpts);
                    }
                    else if (requestOverride && requestOverride.callback) {
                        // If the pager option has been passed, do the pager callback
                        if (newData && newData.pager) {
                            if (requestOverride.pagerCallback) {
                                requestOverride.pagerCallback(this, newData.pager);
                            }
                        }
                        request = requestOverride.callback(this);
                    }

                    if (request) {
                        // The request must implement then
                        if (!request.then) {
                            throw new Error("The request object must implement a then function.");
                        }

                        var scope = this;
                        request.then(
                            function (data) {
                                dataSourceData.onGridLoaded = function () { };
                                dataSourceData.data = transformData(scope, data.data);
                                if (newData && newData.onGridLoaded) {
                                    dataSourceData.onGridLoaded = newData.onGridLoaded;
                                }
                                eventManager.trigger('crm.grid.datasource.afterLoad', {data: dataSourceData.data});
                            },
                            function () {
                                dataSourceData.onGridLoaded = function () { };
                                dataSourceData.data = data = [];
                                if (newData && newData.onGridLoaded) {
                                    dataSourceData.onGridLoaded = newData.onGridLoaded;
                                }
                                eventManager.trigger('crm.grid.datasource.afterLoad', { data: dataSourceData.data });
                            }
                        );
                    }

                    return request;
                },
                cloneRequestData: function () {
                    return angular.extend({}, requestDataCon, userRequestData);
                },
                cloneRequestParameters: function () {
                    return angular.extend({}, requestParamsCon, userRequestParams);
                },
                getPagerCallback: function () {
                    return privRequestProps.pagerCallback;
                },
                setRequestData: function (data, append) {
                    // If the user elects to append request data, do an extend
                    if (requestDataAppend || append) {
                        angular.extend(userRequestData, data);
                    }
                    else {
                        userRequestData = data;
                    }
                },
                setRequestDataValue: function (str, val) {
                    setDeepValue(str, val, userRequestData);
                },
                setRequestParametersValue: function (str, val) {
                    setDeepValue(str, val, userRequestParams);
                },
                getRequestDataValue: function (str) {
                    return getDeepValue(str, userRequestData);
                },
                getRequestData: function () {
                    return angular.extend({}, userRequestData);
                },
                setRequestParameters: function (params, append) {
                    if (requestParamsAppend || append) {
                        angular.extend(userRequestParams, params);
                    }
                    else {
                        userRequestParams = params;

                    }
                },
                clearRequestParameters: function () {
                    // Save the pager params always
                    var pageStart;
                    var pageLimit;
                    if (pagerRequestOpts) {
                        pageStart = this.getRequestParametersValue(pagerRequestOpts.startName);
                        pageLimit = this.getRequestParametersValue(pagerRequestOpts.limitName);
                        userRequestParams = {};
                        this.setRequestParametersValue(pagerRequestOpts.startName, pageStart);
                        this.setRequestParametersValue(pagerRequestOpts.limitName, pageLimit);
                    }
                    else {
                        userRequestParams = {};
                    }
                },
                clearRequestData: function () {
                    // Save the pager params always
                    var pageStart;
                    var pageLimit;
                    if (pagerRequestOpts) {
                        pageStart = this.getRequestDataValue(pagerRequestOpts.startName);
                        pageLimit = this.getRequestDataValue(pagerRequestOpts.limitName);
                        userRequestData = {};
                        this.setRequestDataValue(pagerRequestOpts.startName, pageStart);
                        this.setRequestDataValue(pagerRequestOpts.limitName, pageLimit);
                    }
                    else {
                        userRequestData = {};
                    }
                },
                getData: function () {
                    return dataSourceData.data;
                },
                doGridLoadCallback: function () {
                    var fn = dataSourceData.onGridLoaded || function () { };
                    return fn();
                },
                setDataTotal: function (t) {
                    dataSourceTotal = t;
                },
                getDataTotal: function () {
                    return dataSourceTotal;
                },
                setStart: function(start){
                    if (pagerRequestOpts) {
                        // Update start by request
                        if (pagerRequestOpts.isRequestData) {
                            this.setRequestDataValue(pagerRequestOpts.startName, start);
                        }
                        else { // Otherwise update start by parameters
                            this.setRequestParametersValue(pagerRequestOpts.startName, start);
                        }
                    }
                },
                getPage: function () {
                    if (pagerRequestOpts && pagerRequestOpts.getPage) {
                        return pagerRequestOpts.getPage(this, { startName: pagerRequestOpts.startName, limitName: pagerRequestOpts.limitName });
                    }

                    return 1;
                },
                setLimit: function (limit) {
                    if (pagerRequestOpts) {
                        // Update limit by request
                        if (pagerRequestOpts.isRequestData) {
                            this.setRequestDataValue(pagerRequestOpts.limitName, limit);
                        }
                        else { // Otherwise update limit by parameters
                            this.setRequestParametersValue(pagerRequestOpts.limitName, limit);
                        }
                    }
                },
                getLimit: function () {
                    if (pagerRequestOpts && pagerRequestOpts.getLimit) {
                        return pagerRequestOpts.getLimit(this, { startName: pagerRequestOpts.startName, limitName: pagerRequestOpts.limitName });
                    }

                    return 1;
                },
                getRequest: function () {
                    return requestObject;
                }
            };
        };
    }])
    .factory('crmGridSelectionManager', ['crmGridUtils', function (crmGridUtils) {
        function SelectionManager(opts){
            this._manager = crmGridUtils.createQuickArrayMap(quickArrayMapComp);
            this._rowManager;
            this._opts = {};
            this._opts.beforeSelect = opts.beforeSelect || function (row, index, totalSelectionsAfter) { return true; };
            this._opts.afterSelect = opts.afterSelect || function (row, index) { };
            this._opts.afterDeselect = opts.afterDeselect || function (row, index) { };
            this._opts.onChangeShiftBase = opts.onChangeShiftBase || function (shiftRow, index) { };
            this._isEnabled = true;
            this._key;
        }

        // ----------- Public Methods ------------ //
        SelectionManager.prototype.isEnabled = function () {
            return this._isEnabled;
        };

        SelectionManager.prototype.setEnabled = function (b) {
            this._isEnabled = b;
        };

        // This resets the selection manager completely and deselects any local rows
        SelectionManager.prototype.fullClearAll = function() {
            this._manager.empty();
        };

        SelectionManager.prototype.setRowManager = function(manager){
            this._rowManager = manager;
        };

        SelectionManager.prototype.getSelectedRows = function (copy) {
            var originalData;
            if (copy) {
                originalData = false;
            }
            else {
                originalData = true;
            }
            return this._manager.getItems(originalData);
        };

        SelectionManager.prototype.getSelectedIds = function() {
            return this._manager.getKeys();
        };

        SelectionManager.prototype.isRowSelected = function(row){
            return this.hasSelectedKey(this.getRowHash(row));
        };

        SelectionManager.prototype.getRowHash = function (row) {
            var hash;
            // The selection manager key will always override the row hash function
            if (this._key) {
                hash = row.getData()[this._key];
            }
            else {
                hash = row.getHash();
            }

            return hash;
        };

        SelectionManager.prototype.setRowKey = function (key) {
            // Whenever a new key is set the selections must be cleared
            if (this._key != key) {
                this._key = key;
                this.fullClearAll();
            }
        };

        SelectionManager.prototype.hasSelectedKey = function(key) {
            return this._manager.hasKey(key);
        };

        SelectionManager.prototype.hasSelectedItem = function (item) {
            return this._manager.hasItem(item);
        };

        SelectionManager.prototype.isSelected = function(index) {
            var row = this.getRowByIndex(index);
            var hasSelection = false;

            if (row) {
                hasSelection = this.isRowSelected(row);
            }

            return hasSelection;
        }

        // Toggles the item selection by index
        SelectionManager.prototype.toggleSelection = function(index){
            if(this.hasItems()){
                var row = this.getRowByIndex(index);
                var isSelected = this.isRowSelected(row);
                if (isSelected) {
                    this.removeSelection(index);
                }
                else {
                    this.addSelection(index);
                }    
            }
        };

        SelectionManager.prototype.clearAll = function(){
            var count = this.getRowCount();
            for (var i = 0; i < count; i++) {
                this.removeSelection(i);
            }
        };

        // Removes a selection even if there is not a local row
        SelectionManager.prototype.removeSelectionByKey = function(key) {

            if (this.hasSelectedKey(key)) {
                var index = this._manager.getItemIndexByKey(key); // Get the index of the item in the selection array
                var gridIndex;
                var row;
                
                if (index !== undefined) {
                    row = this.getRowByIndex(index);
                    //gridIndex = this.getItems().indexOf(row);

                    this._manager.removeItemByKey(key);
                    this._opts.afterDeselect([row], [gridIndex]);
                }
            }
        };

        // Selects a local row by index
        SelectionManager.prototype.addSelection = function (index) {
            if(this.hasItems()){
                var row = this.getRowByIndex(index);

                if (row && !this.isRowSelected(row)) {
                    var totalSelections = this._manager.getLength() + 1; // The total number of selections after the selections are made
                    var allowSelection = this._opts.beforeSelect([row], [index], totalSelections);

                    if (allowSelection) {
                        this._manager.push(row);
                        this._opts.afterSelect([row], [index]);
                    }
                }
            }
        };

        SelectionManager.prototype.updateSelectedRow = function (row) {
            if (this.isRowSelected(row)) {
                this._manager.push(row);
            }
        };

        SelectionManager.prototype.toggleRowSelection = function (row){
            var isSelected = this.isRowSelected(row);
            if (isSelected) {
                this.deselectRow(row);
            }
            else {
                this.selectRow(row);
            }
        };

        SelectionManager.prototype.selectRow = function (row) {
            this.addSelectionByKey(this.getRowHash(row));
        };

        SelectionManager.prototype.deselectRow = function (row) {
            this.removeSelectionByKey(this.getRowHash(row));
        };

        SelectionManager.prototype.getRowByIndex = function(index){
            var row;
            if(this.hasItems()){
                row = this._rowManager.getChildByIndex(index);
            }
            return row;
        };

        SelectionManager.prototype.getRowCount = function(){
            var count = 0;
            if(this.hasItems()){
                count = this._rowManager.getChildrenCount();
            }
            return count;
        };

        SelectionManager.prototype.getSelectionCount = function () {
            return this._manager.getLength();
        };

        SelectionManager.prototype.setSelectedRows = function(rows){
            if (rows) {
                this._manager.empty();
                for (var i = 0; i < rows.length; i++) {
                    this._manager.push(rows[i]);
                }
            }
        };

                // Removes the selection by index from the local rows
        SelectionManager.prototype.removeSelection = function(index) {
            if(this.hasItems()){
                var row = this.getRowByIndex(index);

                if (row && this.isRowSelected(row)) {
                    //var index = this._manager.getItemIndexByKey(row.getHash());
                    this._manager.removeItemByKey(this.getRowHash(row));
                }
            }
        };

        SelectionManager.prototype.hasItems = function(){
            return this._rowManager && this._rowManager.getChildrenCount() > 0;
        };

        SelectionManager.prototype.selectAll = function(){
            if(this.hasItems()){
                this.setSelectionByRange(0, this.getRowCount() - 1, true);
            }
        };

        SelectionManager.prototype.clearRange = function (start, end) {
            if(this.hasItems()){
                var newStart = start !== undefined ? start : 0;
                var newEnd = end !== undefined ? end : this.getRowCount() - 1;
                for (var i = newStart; i <= newEnd; i++) {
                    this.removeSelection(i);
                }
            }
        };

        SelectionManager.prototype.setSelectionByRange = function(start, end, keepSelections) {
            var hasItems = this.hasItems();
            if (hasItems && start > -1 && start < this.getRowCount() && start <= end) {
                var itemCount = this.getRowCount();
                // First get the number of new selections
                var curRow;
                var rowsToSelect = [];
                var rowsToSelectIndex = [];
                var rowsToClearCount = 0;

                if (!keepSelections) { // If you are not keeping the local selections you need to track the number of local selections
                    for (var i = 0; i < itemCount; i++) {
                        curRow = this.getRowByIndex(i);

                        // If the row is out of the selection range and is selected mark it for removal
                        if(i < start || i > end){
                            if (this.isRowSelected(curRow)) {
                                rowsToClearCount++;
                            }
                        }
                        else if (!this.isRowSelected(curRow)) { // If the current row has not been selected yet add it to the rows to be selected
                            rowsToSelect[rowsToSelect.length] = curRow;
                            rowsToSelectIndex[rowsToSelectIndex] = i;
                        }
                    }
                }
                else {
                    // Loop through the whole row range and save the rows that are not selected
                    for (var i = start; i <= end; i++) {
                        curRow = this.getRowByIndex(i);

                        // If the current row has not been selected yet add it to the rows to be selected
                        if (!this.isRowSelected(curRow)) {
                            rowsToSelect[rowsToSelect.length] = curRow;
                            rowsToSelectIndex[rowsToSelectIndex] = i;
                        }
                    }
                }

                if (rowsToSelect.length > 0) {

                    // The total number of expected selections, based on the number of rows that should be deselected and selected
                    var totalSelections = this._manager.getLength() + rowsToSelect.length - rowsToClearCount;
                    
                    var allowSelection = this._opts.beforeSelect(rowsToSelect, rowsToSelectIndex, totalSelections);

                    // If a selection is allowed to push the selections to the selection manager
                    if (allowSelection) {

                        // Clear the previous selections if the user does not want to keep them
                        if (!keepSelections) {
                            this.clearAll();
                        }

                        // Select all of the rows that fall within the range
                        for (var i = start; i <= end; i++) {
                            this._manager.push(this.getRowByIndex(i));
                        }

                        this._grid.options.selection.afterSelect(rowsToSelect, rowsToSelectIndex);
                    }
                }
            }
        };


        // Adds a selection even if there is not a local row
        SelectionManager.prototype.addSelectionByKey = function (key) {

            // Add the selection only if the key has not been previously selected
            if (!this.hasSelectedKey(key)) {

                // Find the row and index that this key belongs to

                var curRow;
                var foundRow;
                var index = -1;
                for(var i = 0; i < this.getRowCount() && !foundRow; i++){
                    curRow = this.getRowByIndex(i);
                    if (this.getRowHash(curRow) == key) {
                        foundRow = curRow;
                        index = i;
                    }
                }

                // If the row is not found, add a dummy row
                if (!foundRow) {
                    //foundRow = new CrmGridBlock({ data: { tempKey: key }, hashKey: 'tempKey', type: 'row' })
                    foundRow = { getHash: function () { return key; }, data: {}, type: 'DUMMY_ROW'};
                }

                var finalRowSet = [foundRow];

                var totalSelections = this._manager.getLength() + 1;
                var allowSelection = this._opts.beforeSelect(finalRowSet, [index], totalSelections);

                if (allowSelection) {
                    if (foundRow) {
                        this._manager.push(foundRow);
                    }
                    else {
                        this._manager.pushKey(key);
                    }
                    this._opts.afterSelect([finalRowSet], [index]);
                }
            }
        };

        return {
            create: function(opts){
                return new SelectionManager(opts);
            }
        };
    }])
        // The full selection api. This handles selections for all selection managers
    .factory('crmGridSelectionApi', ['crmGridUtils', function (crmGridUtils) {
        return {
            create: function (opts) {
                // Stores the list of all managers. The first manager is the base manager
                var managerList = [];

                // Handles the row focusfindBlockByAbsoluteIndex(index, rowManager);
                var clickedRow;
                var clickedIndex;
                var focusedRow;
                var shiftBaseRow;
                var isBaseClickChanged;

                // Default the options
                opts = opts || {};
                return {
                    // Deselects all local selections
                    clearAll: function () {
                        managerList.forEach(function (manager) {
                            if (manager.isEnabled()) {
                                manager.clearAll();
                            }
                        });
                    },
                    // Deselectss all local selections and selected keys
                    fullClearAll: function () {
                        managerList.forEach(function (manager) {
                            if (manager.isEnabled()) {
                                manager.fullClearAll();
                            }
                        });
                    },
                    // Select all local rows
                    selectAll: function () {
                        managerList.forEach(function (manager) {
                            if (manager.isEnabled()) {
                                manager.selectAll();
                            }
                        });
                    },
                    // Select rows by range
                    setSelectionByRange: function (row, count, keepSelections) {
                        // Clear all selections if keepSelections is false
                        if (!keepSelections) {
                            var isRowSelected = this.isRowSelected(row);
                            this.clearAll();

                            // Reselect the from block
                            if (isRowSelected) {
                                this.selectRow(row);
                            }
                        }

                        var blocks = getBlockByBlocksFrom(row, count, true, false);

                        // Loop through all of the blocks and select them
                        blocks.forEach(function (b) {
                            var manager = b.getParent().getSelectionManager();
                            if (manager && manager.isEnabled()) {
                                manager.selectRow(b);
                            }
                        });
                    },
                    // Get all of the local rows that are selected
                    getSelectedRows: function () {
                        var results = [];
                        managerList.forEach(function (manager) {
                            var rows = manager.getSelectedRows();
                            rows.forEach(function (r) {
                                results[results.length] = r;
                            });
                        });
                        return results;
                    },
                    // Get all of the selected ids
                    getSelectedIds: function () {
                        var results = [];
                        managerList.forEach(function (manager) {
                            var ids = manager.getSelectedIds();
                            ids.forEach(function (i) {
                                results[results.length] = i;
                            });
                        });
                        return results;
                    },
                    // Deselect local rows by a range
                    clearRange: function (row, count) {
                        getBlockByBlocksFrom(row, count, true, true);

                        // Loop through all of the blocks and deselect them
                        blocks.forEach(function (b) {
                            var manager = b.getParent().getSelectionManager();
                            if (manager && manager.isEnabled()) {
                                manager.deselectRow(b);
                            }
                        });
                    },
                    // Determine if the passed in row is selected
                    isRowSelected: function (row) {
                        var isSelected = false;
                        var manager;
                        for (var i = 0; i < managerList.length && !isSelected; i++) {
                            manager = managerList[i];
                            var selectionManager = row.getParent().getSelectionManager();

                            if (manager && selectionManager == manager && selectionManager.isEnabled()) {
                                isSelected = manager.isRowSelected(row);
                            }
                        }

                        return isSelected;
                    },
                    // Get the number of selections
                    getSelectionCount: function(){
                        var count = 0;
                        // Loop through all of the managers and get the total selections
                        managerList.forEach(function (manager) {
                            if (manager && manager.isEnabled()) {
                                count += manager.getSelectionCount();
                            }
                        });

                        return count;
                    },
                    // Check to see if the passed in rows are all selected rows
                    selectionsEqualTo: function (rows) {
                        var isEqual = true;

                        // Do the test only if rows are passed in
                        if (rows) {
                            isEqual = false;
                            var count = this.getSelectionCount();

                            // Assume manager has the same selections as the passed in rows if the counts are the same
                            if (rows.length == count) {
                                isEqual = true;
                            }

                            // Verify that the selections are equal
                            for (var i = 0; i < rows.length && isEqual; i++) {
                                isEqual = this.isRowSelected(rows[i]);
                            }
                        }
                        
                        return isEqual;
                    },
                    // Select the passed in row
                    selectRow: function (row) {
                        // Get the selection manager from the row. Get the index of the selection manager relative to the list
                        var managerIndex = managerList.indexOf(row.getParent().getSelectionManager());
                        // If the manager exist in the list, select the row if the manager is enabled
                        if (managerIndex > -1) {
                            var manager = managerList[managerIndex];
                            if (manager.isEnabled()) {
                                manager.selectRow(row);
                            }
                        }
                    },
                    // Determine if the row belongs to one of the selection managers
                    isRowInRange: function (row) {
                        var isInRange = false;
                        if (row) {
                            // Get the selection manager from the row
                            var selectionManager = row.getParent().getSelectionManager();
                            // Validate the row if the selection manager belongs to the list of managers
                            if (selectionManager && selectionManager.isEnabled()) {
                                var managerIndex = managerList.indexOf(selectionManager);
                                if (managerIndex > -1) {
                                    var manager = managerList[managerIndex];
                                    if (manager.hasItems()) {
                                        isInRange = row.getIndex() > -1 && row.getIndex() < manager.getRowCount();
                                    }
                                }
                            }
                        }

                        return isInRange;
                    },
                    // Deselect the passed in row
                    deselectRow: function (row) {
                        // Get the selection manager from the row and find the index of the selection manager
                        var index = managerList.indexOf(row.getParent().getSelectionManager());
                        var manager = managerList[index];
                        // If the manager exist and is enabled deselect the row
                        if (manager && manager.isEnabled()) {
                            manager.deselectRow(row);
                        }
                    },
                    updateClickedIndex: function(index){
                        var row = this.getRowByIndex(index);
                        this.updateClickedRow(row);
                    },
                    // Set the passed in row as the row that is clicked. TODO: Add exist in manager validation
                    updateClickedRow: function (row) {
                        clickedRow = row;
                        if (clickedRow) {
                            clickedIndex = row.getAbsoluteIndex();
                        }
                        else {
                            clickedIndex = -1;
                        }
                    },
                    // Get the clicked row
                    getClickedRow: function () {
                        return clickedRow;
                    },
                    getClickedIndex: function(){
                        return clickedIndex;
                    },
                    // Updates the row that was last clicked while the shift key was being held
                    updateShiftBaseRow: function (row) {
                        shiftBaseRow = row;
                        //this._grid.options.selection.onChangeShiftBase(index);
                    },
                    // Gets the row that was last clicked while the shift key was being held
                    getShiftBaseRow: function () {
                        return shiftBaseRow;
                    },
                    // Get the row that is holding the focus
                    getFocusedRow: function () {
                        return focusedRow;
                    },
                    // Set the row that is holding the focus
                    setFocusedRow: function (row) {
                        focusedRow = row;
                    },
                    // Sets the flag that determines if the selection base has been changed by a click
                    setBaseClickChanged: function (changed) {
                        isBaseClickChanged = changed;
                    },
                    // Reset all of the data that deals with row focus, click base, shift base, and etc.
                    resetSelection: function(){
                        this.setBaseClickChanged(false);
                        this.updateClickedRow(undefined);
                        this.setFocusedRow(undefined);
                        this.updateShiftBaseRow(undefined);
                    },
                    // The base row for all selection actions should be set to the passed in row
                    updateBaseFull: function (row) {
                        this.setBaseClickChanged(true);
                        this.updateClickedRow(row);
                        this.setFocusedRow(row);
                        this.updateShiftBaseRow(row);
                    },
                    // The first row should be selected. Also it should become the base row
                    selectFirst: function () {
                        var first;
                        if (managerList && managerList.length > 0) {
                            first = managerList[0].getRowByIndex(0);
                            if (first) {
                                this.selectRow(first)
                                this.setBaseClickChanged(true);
                                this.updateClickedRow(first);
                                this.setFocusedRow(first);
                                this.updateShiftBaseRow(first);
                            }
                        }

                        return first;
                    },
                    // Get the first row
                    getFirst: function () {
                        var first;
                        if (managerList && managerList.length > 0) {
                            first = managerList[0].getRowByIndex(0);
                        }

                        return first;
                    },
                    // Determines is a click changed the shift base
                    isBaseClickChanged: function () {
                        return isBaseClickChanged;
                    },
                    // Gets a row from the selection managers by absolute index
                    getRowByIndex: function(index){
                        var row;
                        // If only one selection manager is available, directly access the the row from the manage
                        if (managerList.length == 1) {
                            row = managerList[0].getRowByIndex(index);
                        }
                        else if(managerList.length > 1){ // Otherwise perform an absolute search
                            row = findBlockByAbsoluteIndex(index, managerList[0]);
                        }

                        return row
                    },
                    // Control click the row that is found at the passed in index
                    doControlClickByIndex: function (index) {
                        var row = this.getRowByIndex(index);
                        
                        // If the row is found, perform the control click on the found row
                        if (row) {
                            this.doControlClickByRow(row);
                        }
                    },
                    // Perform a control click on the current clicked row
                    doControlClick: function () {
                        this.updateShiftBaseRow(this.getClickedRow());
                        this.setFocusedRow(this.getShiftBaseRow());
                        this.setBaseClickChanged(true);

                        if (this.getClickedRow()) {
                            this.toggleRowSelection(this.getClickedRow());
                        }
                    },
                    // Toggle the selection state of the passed in row
                    toggleRowSelection: function (row) {
                        var selections = row.getParent().getSelectionManager();
                        selections.toggleRowSelection(row);
                    },
                    // Perform a control click on the passed in row
                    doControlClickByRow: function (row) {
                        this.updateClickedRow(row);
                        this.doControlClick();
                        //this._$viewPort[0].focus();
                    },
                    addManager: function (manager) {
                        var index = managerList.indexOf(manager);
                        if (index == -1) {
                            managerList[managerList.length] = manager;
                        }
                    },
                    setManagers: function (managers) {
                        managerList = managers;
                    },
                    removeAllManagers: function () {
                        managerList = [];
                    },
                    removeManager: function (manager) {
                        var index = managerList.indexOf(manager)
                        if (index > -1) {
                            managerList.slice(index, 1);
                        }
                    },
                    // Updates the row key of all of the selection managers managed by the selection api
                    setRowKey: function (key) {
                        managerList.forEach(function (manager) {
                            manager.setRowKey(key);
                        });
                    }
                };
            }
        }
    }])
    .factory('crmGridUtils', ['$http', '$templateCache', '$q', function ($http, $templateCache, $q) {

        // A utility function for the QickArrayMap and ArrayMap remove functionality
        function removeItemFromMap(arrMap, item) {
            if (item) {
                delete arrMap._map[arrMap._getCompValue(item)];
            }
        }

        // A utility function for getting items from an array
        function getItemsFromArray(arr, original){
            var result;

            // Return the original array if the user wants the original array
            if (original) {
                result = arr;
            }
            else { // Make a copy of the array by default
                result = [];

                for (var i = 0; i < arr.length; i++) {
                    result[result.length] = arr[i];
                }
            }

            return result;
        }

        // ArrayMap - Allows for fast searching. The data will also keep its original order
        function ArrayMap(compFn) {
            this._arr = [];
            this._map = {};
            this._getCompValue;
            this.setCompareFunction(compFn);
        }

        ArrayMap.prototype.setCompareFunction = function (compFn) {
            this._getCompValue = compFn;

            // Determines how values are going to be compared
            if (!this._getCompValue) {
                this._getCompValue = function (item) {
                    return item;
                };
            }
        };

        ArrayMap.prototype.push = function (item) {
            var addedItem;
            if (!this.contains(item)) {
                var index = this.getLength();
                this._arr[index] = item;
                this._map[this._getCompValue(item)] = item;
                addedItem = item;
            }
            return addedItem;
        };

        ArrayMap.prototype.pop = function () {
            var item;

            if (this.getLength()) {
                item = this._arr.pop();
                removeItemFromMap(this, item);
            }

            return item;
        };

        ArrayMap.prototype.getLength = function () {
            return this._arr.length;
        };

        ArrayMap.prototype.getItemByIndex = function (index) {
            return this._arr[index];
        };

        ArrayMap.prototype.removeItemByKey = function (key) {
            // Get the item from the map
            var item = this._map[key];

            // Find the index from the item
            var index = this._arr.indexOf(item);

            // If the index is found delete the item by index
            if (index > -1) {
                this.removeItemByIndex(index);
            }
        };

        ArrayMap.prototype.removeItemByIndex = function (index) {
            var lastIndex = this._arr.length - 1;
            var item;

            // Remove the item from the array and the map
            if (index == lastIndex) {
                item = this.pop();
            }
            else if (index >= 0 && index < lastIndex) {
                // Remove the last element
                this._arr.slice(index, 1);
                removeItemFromMap(this, item);

            }

            return item;
        };

        ArrayMap.prototype.hasKey = function (key) {
            return this._map[key] !== undefined;
        };

        ArrayMap.prototype.contains = function (item) {
            return this._map[this._getCompValue(item)] !== undefined;
        };

        ArrayMap.prototype.getItemByKey = function (key) {
            return this._map[key];
        };

        ArrayMap.prototype.getItemIndex = function (item) {
            return this._arr.indexOf(item);
        };

        // This returns a map wrapper which allows immutable access to the backing map
        ArrayMap.prototype.createMapAccessor = function(){
            var map = this._map; // Save the map in a separate variable because this._map can be cleared at anytime
            return {
                getItemByKey: function(key){
                    return map[key];
                }
            };
        };

        ArrayMap.prototype.empty = function () {
            this._arr = [];
            this._map = {};
        };

        /********** QuickArrayMap ****************
        * This allows for quick remove, insertion, and searching.
        * However, this is not a good datastructure if the data
        * must retain it's order
        ****************************************/

        // Pass in a key compare function
        function QuickArrayMap(compFn) {
            this._arr = [];
            this._keys = [];
            this._map = {};
            this._getCompValue;
            this.setCompareFunction(compFn);
        }
        
        QuickArrayMap.prototype.setCompareFunction = function (compFn) {
            this._getCompValue = compFn;

            // Determines how values are going to be compared
            if (!this._getCompValue) {
                this._getCompValue = function (item) {
                    return item;
                };
            }
        };

        QuickArrayMap.prototype.getItemIndex = function (item) {
            return this.getItemIndexByKey(this._getCompValue(item));
        };

        QuickArrayMap.prototype.push = function (item) {
            var addedItem;
            var itemIndex = this.getItemIndexByKey(this._getCompValue(item));
            if (itemIndex === undefined) { // If the item does not exist add it
                var index = this.getLength();
                var key = this._getCompValue(item);
                this._arr[index] = item;
                this._keys[index] = key;
                this._map[key] = index;
                addedItem = item;
            }
            else { // If the index is found, update the row
                this._arr[itemIndex] = item;
                addedItem = item;
            }
            return addedItem;
        };

        QuickArrayMap.prototype.pushKey = function (key) {
            if (!this.containsKey(key)) {
                var index = this.getLength();
                this._keys[index] = key;
                this._map[key] = index;
            }
        };

        QuickArrayMap.prototype.pop = function () {
            var item;

            if (this.getLength()) {
                item = this._arr.pop();
                removeItemFromMap(this, item);
                this._keys.pop();
            }

            return item;
        };

        QuickArrayMap.prototype.getLength = function () {
            return this._arr.length;
        };

        QuickArrayMap.prototype.getItemByIndex = function (index) {
            return this._arr[index];
        };

        QuickArrayMap.prototype.removeItemByKey = function (key) {
            var index = this.getItemIndexByKey(key);

            if (index !== undefined) {
                this.removeItemByIndex(index);
            }
        };

        QuickArrayMap.prototype.removeItemByIndex = function (index) {
            var lastIndex = this._arr.length - 1;
            var item;
            if (index == lastIndex) {
                item = this._arr.pop();
                removeItemFromMap(this, item);
                this._keys.pop();
            }
            else if (index >= 0 && index < lastIndex) {

                var theLast = this._arr[lastIndex];
                var lastKey = this._keys[lastIndex];

                // Update the index tracker of the map
                this._map[this._getCompValue(theLast)] = index;
                this._map[this._getCompValue(this._arr[index])] = lastIndex;

                // Move the last to the element of the index that should be removed
                item = this._arr[index]; // The item to delete
                this._arr[index] = theLast; // Override the index of the item to delete
                this._keys[index] = lastKey;

                // Remove the last element
                this._arr.pop();
                this._keys.pop();
                removeItemFromMap(this, item);

            }

            return item;
        };

        QuickArrayMap.prototype.getItems = function (original) {
            return getItemsFromArray(this._arr, original);
        };

        QuickArrayMap.prototype.updateItem = function (item) {
            var key = this._getCompValue(item);

            if (key !== undefined) {
                var index = this.getItemIndexByKey(key);

                if (index !== undefined) {
                    this._arr[index] = item;
                }
            }
        };

        QuickArrayMap.prototype.getKeys = function () {
            /*var arr;

            for (var key in this._map) {
                arr[arr.length] = key;
            }*/

            return this._keys;
        };

        QuickArrayMap.prototype.getItemIndexByKey = function (key) {
            if (key !== undefined) {
                return this._map[key];
            }
        };

        QuickArrayMap.prototype.hasKey = function (key) {
            return this.getItemIndexByKey(key) !== undefined;
        };

        QuickArrayMap.prototype.hasItem = function (item) {
            var index = this.getItemIndexByKey(this._getCompValue(item));
            return this._arr[index] !== undefined;
        };

        QuickArrayMap.prototype.contains = function (item) {
            return this.getItemIndexByKey(this._getCompValue(item)) !== undefined;
        };

        QuickArrayMap.prototype.containsKey = function (key) {
            return this.getItemIndexByKey(key) !== undefined;
        };

        QuickArrayMap.prototype.getItemByKey = function (key) {
            var index = this.getItemIndexByKey(key);
            var item;

            if (index !== undefined) {
                item = this._arr[index];
            }

            return item;
        };

        QuickArrayMap.prototype.empty = function () {
            this._arr = [];
            this._map = {};
            this._keys = [];
        };

        function QuickArray() {
            this._arr = [];
        }

        QuickArray.prototype.push = function (item) {
            var index = this._arr.length;
            this._arr[index] = item;
            return item;
        };

        QuickArray.prototype.pop = function () {
            return this._arr.pop();
        };

        QuickArray.prototype.getLength = function () {
            return this._arr.length;
        };

        QuickArray.prototype.removeByIndex = function (index, callback) {
            var lastIndex = this._arr.length - 1;
            var item;
            if (index == lastIndex) {
                item = this._arr.pop();

                if (callback) {
                    callback(item);
                }
            }
            else if (index >= 0 && index < lastIndex) {
                
                var theLast = this._arr[lastIndex];
                //this._arr[lastIndex] = this._arr[index];

                // Move the last to the element of the index that should be removed
                this._arr[index] = theLast;

                // Remove the last element
                item = this._arr.pop();

                if (callback) {
                    callback(item, theLast);
                }
            }

            return item;
        };

        QuickArray.prototype.getArray = function () {
            return this._arr;
        };

        QuickArray.prototype.empty = function () {
            this._arr = [];
        };

        function UnorderedKeyManager() {
            this._quickArr = new QuickArray();
            this._map = {};
        }

        function convertKey(key){
            return key.toString().toLocaleLowerCase();
        }

        UnorderedKeyManager.prototype.clearAll = function () {
            this._map = {};
            this._quickArr.empty();
        };

        UnorderedKeyManager.prototype.add = function (key) {
            var modKey = convertKey(key);

            // Only add the key if it is undefined. The map saves the array index
            if (this._map[modKey] === undefined) {
                this._map[modKey] = this._quickArr.getLength();
                this._quickArr.push(modKey);
            }
        };

        UnorderedKeyManager.prototype.remove = function (key) {
            var modKey = convertKey(key);
            var self = this;

            // Remove the key if it is present
            if (self._map[modKey] !== undefined) {
                var index = self._map[modKey];
                delete self._map[modKey];

                // Update the index of the last item - This is used for fast tracking because the removed item and the last item swap places
                this._quickArr.removeByIndex(index, function (removedKey, lastKey) {
                    if (lastKey !== undefined) {
                        self._map[lastKey] = index;
                    }
                });
            }
        };

        UnorderedKeyManager.prototype.doesKeyExist = function (key) {
            return this._map[convertKey(key)] !== undefined;
        };

        UnorderedKeyManager.prototype.getIndexOf = function (key) {
            return this._map[convertKey(key)];
        };

        UnorderedKeyManager.prototype.getArray = function () {
            return this._quickArr.getArray();
        };

        return {
            getTemplateFromUrl: function (url) {
                var promise;

                // Callback for the template only if there is a url
                if (url) {
                    // Check to see if the template url already exist in the cache
                    var html = $templateCache.get(url);
                    if (!html) {

                        // Callback for the template
                        promise = $http.get(url).then(
                            function (data) {
                                var returnedData = '';
                                // If html is pulled from the server cache it
                                if (data && data.data) {
                                    $templateCache.put(url, data.data);
                                    returnedData = data.data;
                                }
                                return returnedData;
                            },
                            function () {
                                throw new Error("Could not load " + url);
                            }
                        );
                    }
                    else {
                        // Return a new promise if the template already exist
                        promise = $q.defer();
                        promise.resolve(html);
                        promise = promise.promise;
                    }
                }

                return promise;
            },

            createQuickArray: function () {
                return new QuickArray();
            },

            createArrayMap: function(fn){
                return new ArrayMap(fn);
            },

            createUnorderedKeyManager: function () {
                return new UnorderedKeyManager();
            },

            createQuickArrayMap: function (fn) {
                return new QuickArrayMap(fn);
            }
        }
    }])
    .factory('crmGridClasses', ['crmGridUtils', 'crmGridSelectionApi', 'crmGridSelectionManager', function(crmGridUtils, crmGridSelectionApi, crmGridSelectionManager){ // ------ crmGridClasses - The model classes that build up a grid

        // This is the smallest a block can be regardless if the user sets a minimum or not
        var globalMinBlockSize = 30;

        return {
            // This function will create a grid blocks and managers that will be configured based  on the grid options
            createGridClassesFactory: function(gridOptions){
                // Get the initial options
                var gridOpts = angular.extend({}, gridOptions);

                // Create the selection api if selections are enabled
                var selectionApi;
                if(gridOpts.enableSelection){
                    selectionApi = crmGridSelectionApi.create(gridOpts.selection);
                }

                // Define the object representation of the grid factory
                var factoryScope = {
                    // Creates a new block based on the factory settings and passed in options
                    createCrmGridBlock: function (opts) {
                        // Create a new block
                        var block = new CrmGridBlock(opts);
                        // return the final block
                        return block;
                    },
                    // The selection api that is used for the grid
                    getSelectionApi: function () {
                        return selectionApi
                    },
                    getRowKey: function(){
                        return gridOpts.rowKey;
                    },
                    // Add container data (position, size, and etc) to a block
                    addContainerData: addContainerData,
                    // This creates a manger. This is used to instantiate a row or column manager
                    createBlockManager: function (type) {
                        // The parent manager that contains all blocks
                        var blocks = crmGridUtils.createArrayMap(type == 'row' ? quickArrayMapComp : function (item) { return item.index;});
                        var managerType = type;
                        var selectionManager;
                        var hasVisibleChildren = true;
                        // The block key should be defaulted to the initial grid settings
                        var hashKey = type == 'row' ? factoryScope.getRowKey() : undefined;
                        // The data that the rows should be based on. This data is only for the base parent manager
                        var blockData;
                        var managerObj = {
                            // Set the key that each row's hash is based on
                            setHashKey: function (key) {
                                // If the row key is changed, the current row hashes will be invalid.
                                // All rows and children rows will be cleared. New rows will have to be mapped.
                                if (hashKey != key) {
                                    hashKey = key;
                                    blocks.empty();
                                }
                            },
                            // Get the key that each row's hash is based on
                            getHashKey: function () {
                                return hashKey;
                            },
                            getType: function () { return managerType; },
                            createMapAccessor: function () {
                                return blocks.createMapAccessor();
                            },
                            empty: function () {
                                accessorMap = this.createMapAccessor();
                                blocks.empty();
                            },
                            removeContainerData: function () {
                                this._conData = undefined;
                            },
                            getContainerData: function (key) {
                                return getBlockContainerData.call(this, key);
                            },
                            addChild: function (child) {
                                blocks.push(child);
                            },
                            setChildData: function (data) {
                                blockData = data;
                                this.refreshChildren();
                            },
                            refreshChildren: function () {
                                if (blockData) {
                                    // The high order function for getting the existing block
                                    var accessorMap = blocks.createMapAccessor();
                                    var getExistingBlock = function (key) {
                                        return accessorMap.getItemByKey(key);
                                    };

                                    // Update the blocks
                                    var managers = updateBlocksFromData(this, {
                                        data: blockData,
                                        blockType: this.getType(),
                                        accessorFunction: getExistingBlock
                                    });

                                    // Map the selection managers
                                    if (selectionApi && this.getType() == "row") {
                                        // Remove all selection managers from the base selection api
                                        selectionApi.removeAllManagers();

                                        // Loop through all of the grid block managers
                                        managers.forEach(function (m) {
                                            var newManager = m.getSelectionManager();
                                            if (!newManager) {
                                                newManager = crmGridSelectionManager.create(gridOpts.selection);
                                            }

                                            m.setSelectionManager(newManager);
                                        });
                                    }
                                }
                            },
                            getAbsolutePos: function () {
                                return this.getPos();
                            },
                            getAbsoluteEnd: function () {
                                return this.getEnd();
                            },
                            getPos: function () {
                                return this.getContainerData('pos');
                            },
                            getEnd: function () {
                                return this.getContainerData('end');
                            },
                            getSize: function () {
                                return 0;
                            },
                            getChildrenCount: function () {
                                return blocks.getLength();
                            },
                            getChildByIndex: function (index) {
                                return blocks.getItemByIndex(index);
                            },
                            getChildIndex: function (child) {
                                return blocks.getItemIndex(child);
                            },
                            getChildByKey: function (key) {
                                return blocks.getItemByKey(key);
                            },
                            hasVisibleChildren: function () {
                                return hasVisibleChildren;
                            },
                            setHasVisibleChildren: function (v) {
                                hasVisibleChildren = v;
                                this.refreshChildren();
                            },
                            // Attachs a selection manager to the grid block manager
                            setSelectionManager: function (newSelManager) {
                                if (selectionApi) {
                                    selectionManager = newSelManager;
                                    newSelManager.setRowManager(this);
                                    selectionApi.addManager(newSelManager);
                                }
                            },
                            // Removes the current selection manager form the grid block manager
                            removeSelectionManager: function () {
                                if (selectionManager && selectionApi) {
                                    selectionApi.removeManager(selectionManager);
                                    manager.setRowManager(undefined);
                                    this._selectionManager = undefined;
                                }
                            },
                            getSelectionManager: function () {
                                return selectionManager;
                            },
                            getParent: function (block) {
                                var parent;

                                // Make sure the block is not the managerObj
                                if (block && block != managerObj) {
                                    // This will return the block's parent
                                    if (block.getParent()) {
                                        parent = block.getParent();
                                    }
                                    else { // Return the manager object whenever the block does not have a parent
                                        parent = managerObj;
                                    }
                                }

                                return parent;
                            },
                            // Gets a block based on the position of the scrollbar
                            getBlockByScrollPosition: function (scrollPos) {
                                var foundBlock; // The found block based on the scroll position
                                //scrollPos = 201;
                                var managerAndIndex = getNestedBlockIndexByScrollPosition(this, 'getChildrenCount', 'getChildByIndex', scrollPos);

                                /*// Debug
                                for(var i = 0; i < 30; i++){
                                    var manIndex = getNestedBlockIndexByScrollPosition(this, 'getChildrenCount', 'getChildByIndex', i * 35);
                                    console.log(manIndex.manager.getChildByIndex(manIndex.index).data.id);
                                }*/

                                // If the index and the manager exist then get the block based on the index
                                if (managerAndIndex && managerAndIndex.index > -1 && managerAndIndex.manager) {
                                    foundBlock = managerAndIndex.manager.getChildByIndex(managerAndIndex.index);
                                }

                                return foundBlock;
                            }
                        };

                        // Add the container data for the base parent
                        addContainerData(managerObj, getNewContainerData(0));
                        return managerObj;
                    }
                };

                /*********** Utility functions for the createGridClassesFactory ****************/

                // Utility function for recalculating the container data for a given block manager and its nested managers
                function resyncAllBlockPositions(manager, pos, absoluteObj, blockManagerList, noChildren){
                    var containerData = getNewContainerData(pos);
                    var curBlock;
                    blockManagerList[blockManagerList.length] = manager;
                    updateBlockSelection(manager);

                    // Loop through all of the manager's children only if it has visible children
                    if(manager.hasVisibleChildren() && !noChildren){
                        // Reset the manager's container data
                        addContainerData(manager, containerData);
                        // Process all of the children that are in the manager
                        for(var i = 0; i < manager.getChildrenCount(); i++){
                            curBlock = manager.getChildByIndex(i);
                            resyncBlockPositions(containerData, curBlock);
                            updateBlockSelection(curBlock);
                            curBlock.setAbsoluteIndex(absoluteObj.absoluteIndex);
                            absoluteObj.absoluteIndex++;

                            // Process another container if the child has children
                            if(curBlock.getChildrenCount() > 0){
                                var childContainer = resyncAllBlockPositions(curBlock, getContainerDataEnd.call(containerData), absoluteObj, blockManagerList);

                                // The parent container should increase with the child size
                                containerData.totalsize += childContainer.totalsize;
                            }
                        }

                        // Attach the container data to the manager
                        addContainerData(manager, containerData);
                    }
                    else{
                        // Set the absolute index for each block
                        // Process all of the children that are in the manager
                        var curBlock;

                        manager.removeContainerData();

                        for(var i = 0; i < manager.getChildrenCount(); i++){
                            curBlock = manager.getChildByIndex(i);
                            resyncBlockPositions(containerData, curBlock, true);
                            curBlock.setAbsoluteIndex(absoluteObj.absoluteIndex);
                            absoluteObj.absoluteIndex++;
                            curBlock.removeContainerData();

                            if (curBlock.getChildrenCount() > 0) {
                                resyncAllBlockPositions(curBlock, getContainerDataEnd.call(containerData), absoluteObj, blockManagerList, true);
                            }
                        }
                    }

                    // Return the current container data
                    return containerData;
                }

                // A utility method creating grid blocks based on the passed in data
                function updateBlocksFromData(parent, opts){
                    var blocks = [];
                    var blockManagerList = [];

                    parent.empty(); // Clear all of the blocks.

                    // The options that are available for this function
                    opts = opts || {};
                    var data = opts.data;
                    var blockType = (opts.blockType || '').toLocaleLowerCase();
                    var isRowType = blockType == 'row';
                    var blockFnName = isRowType ? 'getRowBlock' : 'getColBlock';
                    var blockOptionsName = opts.blockOptionsName;

                    // TODO: Allow additional options to be passed in for overriding the grid options that are based on the blockOptionsName config
                    // var hashKey = opts.hashKey || blockOptionsName.hashKey;

                    if(!blockOptionsName){
                        if(isRowType){
                            blockOptionsName = 'rows';
                        }
                        else{
                            blockOptionsName = 'cols';
                        }
                    }

                    // Get the specified options or use the default
                    var blockOptions = gridOpts.blockOptions[blockOptionsName] || {};

                    var curBlock; // The current block

                    // The options for generating a block
                    function getCreateBlockOpts (data, index) {
                            return {
                            data: data,
                            index: index,
                            accessorFunction: opts.accessorFunction
                        };
                    }

                    // Convert all of the data into the appropriate blocks
                    for(var index = 0; index < data.length; index++){
                        curBlock = blockFromData[blockFnName](parent, getCreateBlockOpts(data[index], index));
                        parent.addChild(curBlock);
                    }

                    // Get the base parent
                    var baseParent = parent;
                    while(baseParent && baseParent.getParent()){
                        baseParent = baseParent.getParent();
                    }

                    // Set the sizes for all blocks and containers
                    resyncAllBlockPositions(baseParent, 0, {absoluteIndex: 0}, blockManagerList);

                    return blockManagerList;
                }

                // The blockFromData object stores functions that will retrieve blocks based on the manager type.
                // This object is used by the updateBlocksFromData function
                var blockFromData = {
                    getRowBlock: function(parent, opts){
                        var resultBlock;

                        opts = opts || {};
                        var index = opts.index;

                        // Look for existing row
                        var hashKey = parent.getHashKey();
                        if(hashKey && opts.accessorFunction){
                            resultBlock = opts.accessorFunction(opts.data[hashKey]);

                            // Set the new data to the found block
                            if(resultBlock){
                                resultBlock.setData(opts.data);
                            }
                        }

                        // If the block does not exist yet, create it
                        if(!resultBlock){
                            var randomAdj = 0;
                            resultBlock = new CrmGridBlock({data: opts.data, size: gridOpts.blockOptions.rows.size || gridOpts.rowHeight, minSize: gridOpts.minSize, hashKey: hashKey, parent: parent, dataFormatter: gridOpts.dataFormatter, type: 'row', index: opts.index});
                        }
                        else{
                            resultBlock.removeContainerData();
                        }

                        return resultBlock;
                    },
                    getColBlock: function(parent, opts){
                        // Look for existing col
                        // TODO: Have nested columns
                        /*if(gridOptions.hashKey && opts.accessorFunction){
                            resultBlock = opts.accessorFunction(data[hashKey]);
                        }*/

                        // If the block does not exist yet, create it
                        var resultBlock;
                        opts = opts || {};
                        var index = opts.index;
                        var minSize = gridOpts.minSize || minColumnWidth;
                        if (minSize < minColumnWidth) {
                            minSize = minColumnWidth;
                        }

                        /*if(!resultBlock){
                            resultBlock = new CrmGridBlock({data: opts.data, size: opts.data.size || (gridOpts.blockOptions.cols.size || gridOpts.colWidth), minSize: gridOpts.minSize, hashKey: gridOpts.hashKey, index: index, dataFormatter: gridOpts.dataFormatter, type: 'col'});
                        }
                        else{
                            resultBlock.removeContainerData();
                        }*/
                        resultBlock = resultBlock = new CrmGridBlock({ data: opts.data, size: opts.data.size || (gridOpts.blockOptions.cols.size || gridOpts.colWidth), minSize: minSize, hashKey: gridOpts.hashKey, index: index, dataFormatter: gridOpts.dataFormatter, type: 'col', parent: parent });

                        return resultBlock;
                    }
                };

                // Defines a CrmGridBlock - A block can be either a row or column
                // Notice this is defined on a grid config bases
                function CrmGridBlock(opts){

                    //opts = {data, size, hashKey, dataFormatter, index, minSize}
                    opts = opts || {};

                    this._dataFormatter = opts.dataFormatter;
                    this._userData = {};
                    this.data = opts.data;
                    this._size;
                    this._minSize = opts.minSize || globalMinBlockSize;
                    this._isVisible = true;
                    this._pos;
                    this._end;
                    this._hashKey = opts.hashKey; // The key that should be used when finding the has for the row
                    this.index = opts.index;
                    this._absoluteIndex;
                    this._parent = opts.parent;
                    this._type = opts.type;
                    this._selectionManager;
                    this._hasVisibleChildren = false;
                    this._blockOptionsName;
                    //this._data;

                    // Set the size and position
                    this.setSizeAndPos(opts.size, opts.pos);

                    // Children blocks
                    this._childBlocks = [];
                }

                CrmGridBlock.prototype.hasVisibleChildren = function(){
                    return this._hasVisibleChildren;
                };

                CrmGridBlock.prototype.setHasVisibleChildren = function(v){
                    this._hasVisibleChildren = v;
                    this.refreshChildren();
                };

                // This updates the key for the row
                CrmGridBlock.prototype.setHashKey = function (key, shallow) {
                    // If a new key is entered, the direct children's hashes should be reset.
                    // Any nesting should be handled by each childs setHasKey function
                    if (this._hashKey != key) {
                        this._hashKey = key;
                        // Change the descendant keys as long has the user doesn't disallow it
                        if (!shallow) {
                            this._childBlocks.forEach(function (block) {
                                block.setHashKey(key);
                            });

                            if (this.getSelectionManager()) {
                                this.getSelectionManager().setRowKey(key);
                            }
                        }
                    }
                };

                // Gets the current hash key for the block
                CrmGridBlock.prototype.getHashKey = function () {
                    return this._hashKey;
                };

                // Sets the selection manager for the block.
                // The selection manager is used to manage the selection of children rows
                // A selection manager should only be attached to a block if it is a parent
                CrmGridBlock.prototype.setSelectionManager = function(manager){
                    if(selectionApi){
                        this._selectionManager = manager;
                        manager.setRowManager(this);
                        selectionApi.addManager(manager);
                    }
                };

                // Remove the selection manager from a block
                CrmGridBlock.prototype.removeSelectionManager = function(){
                    if(this._selectionManager && selectionApi){
                        selectionApi.removeManager(this._selectionManager);
                        manager.setRowManager(undefined);
                        this._selectionManager = undefined;
                    }
                };

                // Get the selection manager
                CrmGridBlock.prototype.getSelectionManager = function(){
                    return this._selectionManager;
                };

                // Set the absolute index of the block. This assumes blocks are arranged top to bottom and disregards nesting
                CrmGridBlock.prototype.setAbsoluteIndex = function(index){
                    this._absoluteIndex = index;
                };

                // Get the absolute index of the block. This assumes blocks are arranged top to bottom and disregards nesting
                CrmGridBlock.prototype.getAbsoluteIndex = function(){
                    return this._absoluteIndex;
                };

                CrmGridBlock.prototype.getBlockOptionsName = function(){
                    return this._blockOptionsName;
                };

                CrmGridBlock.prototype.setBlockOptionsName = function(name){
                    this._blockOptionsName = name;
                };

                CrmGridBlock.prototype.setVisible = function(b){
                    this._isVisible = b;
                };

                CrmGridBlock.prototype.isVisible = function(){
                    return this._isVisible;
                };

                CrmGridBlock.prototype.getHash = function(){

                    var result;

                    if(this.data){
                        if(this._hashKey){
                            result = this.data[this._hashKey];
                        }
                    }

                    return result;
                };

                CrmGridBlock.prototype.getSize = function(){
                    var result = this._size;

                    var minSize = this.getMinSize();
                    if(!result || result < minSize){
                        result = minSize;
                    }

                    return result;
                };

                CrmGridBlock.prototype.getMinSize = function(){
                    return this._minSize;
                };

                CrmGridBlock.prototype.setSizeAndPos = function(size, pos){

                    // Default the size of the block if it does not exist
                    size = size || 0;

                    // Apply the minimum size if the size is too small
                    if (size < this.getMinSize()) {
                        size = this.getMinSize();
                    }

                    // If the position does not exist try to calculate it
                    if(pos === undefined){
                        pos = 0;
                        if(this._index !== undefined){
                            pos = this._index * size;
                        }
                    }

                    this._size = size;
                    this._pos = (pos || this._pos);
                    //this._end = this._pos + this._size;
                };

                CrmGridBlock.prototype.getIndex = function () {
                    var index = -1;
                    if (this.getParent()) {
                        index = this.getParent().getChildIndex(this);
                    }
                    else {
                        index = this.index;
                    }

                    return index;
                };

                CrmGridBlock.prototype.setSize = function(size){
                    if(size !== undefined){
                        this._size = size;
                        //this._end = this._pos + this._size;
                    }
                };

                CrmGridBlock.prototype.getPos = function(){
                    return this._pos;
                };

                CrmGridBlock.prototype.setPos = function(pos){
                    if(pos !== undefined){
                        this._pos = pos;
                        //this._end = this._pos + this._size;
                    }
                };

                CrmGridBlock.prototype.getAbsolutePos = function(){
                    var parent = this.getParent();
                    var result = this.getPos();
                    if(parent && result > -1){
                        result += parent.getContainerData('pos');
                    }

                    return result;
                };

                CrmGridBlock.prototype.getEnd = function(){
                    return this.getSize() + this.getPos();
                };

                CrmGridBlock.prototype.getAbsoluteEnd = function(){
                    var end;
                    if(this.getPos() >= 0){
                        end = this.getAbsolutePos() + this.getSize()
                    }
                    else{
                        end = -1;
                    }
                    return end;
                };

                CrmGridBlock.prototype.setUserData = function(key, value){
                    this._userData[key] = value;
                };

                CrmGridBlock.prototype.getUserData = function(key){
                    return this._userData[key];
                };

                CrmGridBlock.prototype.setData = function(data){
                    this.data = data;
                };

                CrmGridBlock.prototype.getData = function(fieldName){
                    var result = '';

                    // If a formatter is passed in then use the formatter otherwise just return the regular data
                    if (this._dataFormatter) {
                        if (fieldName) {
                            result = this._dataFormatter(this.data, fieldName);
                        }
                        else {
                            result = this.data;
                        }
                        return result;
                    }
                    else {
                        if (fieldName) {
                            result = this.data[fieldName];
                        }
                        else {
                            result = this.data;
                        }
                    }

                    return result;
                };

                CrmGridBlock.prototype.empty = function(){
                    this._childBlocks = [];
                };

                CrmGridBlock.prototype.addChild = function(block){
                    //block._parent = this;
                    this._childBlocks[this._childBlocks.length] = block;
                };

                CrmGridBlock.prototype.getType = function(){
                    return this._type;
                };

                // This makes a block have nested blocks. This is based on the data array that is passed in.
                CrmGridBlock.prototype.setChildData = function(data, blockOptionsName){
                    this._childBlocks = [];
                    this._data = data;

                    this._blockOptionsName = blockOptionsName;
                    this.refreshChildren();
                };

                CrmGridBlock.prototype.refreshChildren = function () {
                    var allBlocks = this._childBlocks;
                    if (allBlocks) {
                        // The high order function for getting the existing block
                        var getExistingBlock = function (key) {
                            var curBlock;
                            var foundBlock;
                            for (var i = 0; i < allBlocks.length && !foundBlock; i++) {
                                curBlock = allBlocks[i];
                                if (curBlock.getHash() == key) {
                                    foundBlock = curBlock;
                                }
                            }
                            return curBlock;
                        };

                        // Update the blocks and get the list of new block managers
                        // When refreshing children blocks the whole row tree must be restructured
                        var managers = updateBlocksFromData(this, {
                            data: this._data,
                            blockType: this.getType(),
                            blockOptionsName: this._blockOptionsName,
                            accessorFunction: getExistingBlock
                        });

                        // Map the selection managers
                        if (selectionApi && this.getType()) {
                            selectionApi.removeAllManagers();
                            // Loop through all of the block managers
                            managers.forEach(function (m) {
                                var newManager = m.getSelectionManager();
                                if (!newManager) {
                                    newManager = crmGridSelectionManager.create(gridOpts.selection);
                                }

                                // Each block manager should have a selection manager that manages the selections of the contained rows 
                                m.setSelectionManager(newManager);
                            });
                        }
                    }
                };

                CrmGridBlock.prototype.getParent = function(){
                    return this._parent;
                };

                CrmGridBlock.prototype.removeContainerData = function () {
                    this._conData = undefined;
                };

                CrmGridBlock.prototype.getContainerData = function (key) {
                    return getBlockContainerData.call(this, key);
                };

                CrmGridBlock.prototype.getChildrenCount = function(){
                    return this._childBlocks.length;
                };

                CrmGridBlock.prototype.getChildIndex = function (block) {
                    return this._childBlocks.indexOf(block);
                };

                CrmGridBlock.prototype.getChildByIndex = function(index){
                    return this._childBlocks[index];
                };

                // Return the factory for generating clones of CrmGrid objects.
                return factoryScope;
            }
        }
    }])// ----- crmGrid - This is the main grid directive ---------------------------- //
    .directive('crmGrid', ['crmGridUtils', '$timeout', '$window', 'crmGridClasses', 'crmGridSelectionManager', 'crmGridSelectionApi', 'crmGridPager',
    function (crmGridUtils, $timeout, $window, crmGridClasses, crmGridSelectionManager, crmGridSelectionApi, crmGridPager) {

        function copyFieldData(data, fn) {
            var result = [];
            if (data) {
                fn = fn || function () { };
                var cur;
                for (var i = 0; i < data.length; i++) {
                    cur = data[i];
                    result[result.length] = {
                        template: cur.template,
                        headerTemplate: cur.headerTemplate,
                        label: cur.label || cur.value,
                        value: cur.value,
                        getText: cur.getText,
                        size: cur.size,
                        sort: cur.sort
                    };

                    fn(result[result.length - 1], i, {isHidden: cur.isHidden, defaultSize: cur.defaultSize});
                }
            }

            return result;
        }

        return {
            scope: {
                crmGrid:'='
            },
            link: function (scope, element, attrs) {
                var thisDirective = this;

                var windowEl = angular.element($window);

                // The view windows require these variables
                var $viewPort; // The main view port. This scrolls the content of the grid
                var $content;   // The content of the grid. This content contains the rows
                var $fixedColsContainer; // The container for fixed columns. When scrolling vertically, logic needs to be implemented to prevent this from moving

                var $crmGrid;
                
                var $viewPortContainer;
                var $colHeaders;
                var $colHeadersContainer;

                var defaultMinColWidth = minColumnWidth;
                var dragMinColWidth = defaultMinColWidth;

                // Get the min col width from the user or the default
                if(scope.options.minColWidth === undefined){
                    dragMinColWidth = defaultMinColWidth;
                }

                // Set the default col width to the min col width if it is not defined
                if (scope.options.colWidth === undefined) {
                    scope.options.colWidth = dragMinColWidth;
                }

                // Load the custom templates (TODO: Better ajax loading)
                if (scope.options.rowTemplateUrl || scope.options.rowCellTemplateUrl) {
                    if (scope.options.rowTemplateUrl) {
                        crmGridUtils.getTemplateFromUrl(scope.options.rowTemplateUrl).then(function (template) {
                            scope.options.rowTemplate = template;
                            crmGridUtils.getTemplateFromUrl(scope.options.rowCellTemplateUrl).then(function (cellTemplate) {
                                scope.options.rowCellTemplate = cellTemplate;
                                createGrid();
                            });
                        });
                    }
                }
                else {
                    createGrid();
                }

                // The main function that creates the grid
                function createGrid() {
                    // The virtualization object
                    initGridElements();
                    refreshFixedColsEl();

                    // Create the view windows for the cols and the rows
                    var viewWindowRows = scope.viewWindowRows = createViewWindow(scope.rowManager, true);
                    var viewWindowCols = scope.viewWindowCols = createViewWindow(scope.colManager);
                    var viewWindowFixedCols; scope.viewWindowFixedCols;

                    // Set the view ports initial height
                    resizeViewport();

                    // Watch for changes to the grid
                    doGridWatch();

                    // Watch for viewer events
                    doGridEvents();

                    // Configure the application scope
                    initApplicationScope();

                    // Expose the grids api to the public
                    exposeGridApi();

                    // Apply the fixed columns
                    scope.api.grid.setFixedCols(scope.options.fixedCols);

                    // Set the initial data rows
                    scope.api.grid.setData(scope.options.data);

                    // Save the application scope
                    scope.appScope = thisDirective.appScope = scope.$parent;
                }

                function resizeViewport() {
                    var heightAdjustments = 0; // The height adjustments for the viewport. This considers the col headers and pager

                    $pager = angular.element(element[0].getElementsByClassName('crm-grid-pager')[0]);
                    heightAdjustments = $pager.outerHeight();

                    heightAdjustments += $colHeadersContainer.outerHeight();

                    $viewPort.outerHeight(element.outerHeight() - heightAdjustments);
                    $viewPortContainer.outerHeight($viewPort.outerHeight());

                    if (scope.viewWindowFixedCols && viewWindowFixedCols.getBlocks() && viewWindowFixedCols.getBlocks().length && scope.api.grid.isColumnsVisible()) {
                        var fixedColsWidth = scope.viewWindowFixedCols.getContentSize();
                        $viewPort.outerWidth($viewPortContainer.outerWidth() - fixedColsWidth);
                        $viewPort.css('left', fixedColsWidth + 'px');
                        $fixedColsContainer.outerWidth(fixedColsWidth);
                    }
                    else {
                        $viewPort.css('width', '100%');
                        $viewPort.css('left', '0px');
                    }
                }

                function refreshFixedColsEl() {
                    $fixedColsContainer = angular.element(element[0].getElementsByClassName('crm-fixed-cols-container')[0]);
                }

                // Finds the grid elements and stores them in references
                function initGridElements() {
                    $crmGrid = angular.element((element[0].getElementsByClassName('crm-grid')[0])); // The view port
                    $viewPort = angular.element((element[0].getElementsByClassName('crm-grid-viewport')[0])); // The view port
                    $content = angular.element((element[0].getElementsByClassName('crm-grid-scroll-container')[0])); // The content container that holds all of the rows and cols
                    $colHeaders = angular.element((element[0].getElementsByClassName('crm-grid-col-headers-inner')[0]));
                    $colHeadersContainer = angular.element((element[0].getElementsByClassName('crm-grid-col-headers-container')[0]));
                    $viewPortContainer = angular.element(element[0].getElementsByClassName('crm-grid-viewport-container')[0]);
                }

                function initApplicationScope() {
                    // Save the application scope
                    var scopeName = 'appScope';
                    if (scope.options.scopeName) {
                        scopeName = scope.options.scopeName;
                    }

                    scope[scopeName] = thisDirective[scopeName] = scope.$parent;
                }

                // Exposes the grid api
                function exposeGridApi() {
                  
                    // Add the setFixedCols method to the api
                    scope.api.grid.setFixedCols = function (cols) {
                    	viewWindowFixedCols = scope.viewWindowFixedCols = undefined;
                        if (cols) {
                            // Set the new col data, make a new col window, and make a new copy of the blocks from the block manager
                            scope.fixedColManager.setChildData(cols);
                            viewWindowFixedCols = scope.viewWindowFixedCols = createViewWindow(scope.fixedColManager);
                            viewWindowFixedCols.saveBlocksFromManager();

                            // Set all fixedCols sort to false by default
                            var curBlock;
                            for (var i = 0; i < viewWindowFixedCols.getBlocks().length; i++) {
                                curBlock = viewWindowFixedCols.getBlocks()[i];
                                if (curBlock.sort === undefined) {
                                    curBlock.sort = false;
                                }
                            }
                        }
                    };

                    // Get the width of all fixed columns combined. This also considers the columns visibility when calculating
                    scope.api.grid.getFixedColsWidth = function () {
                        var fixedColWidth = 0;
                        if (viewWindowFixedCols && viewWindowFixedCols.getBlocks() && viewWindowFixedCols.getBlocks().length > 0 && scope.api.grid.isColumnsVisible()) {
                            fixedColWidth = viewWindowFixedCols.getContentSize();
                        }
                        return fixedColWidth;
                    };

                    scope.api.grid.blur = function () {
                        $timeout(function () {
                            $viewPort[0].blur();
                        });
                    };

                    scope.api.grid.focus = function () {
                        $timeout(function () {
                            $viewPort[0].focus();
                        });
                    };

                    scope.api.grid.resizeViewport = function () {
                        resizeViewport();
                        $timeout(function () {
                            refreshRenderBlocks();
                        });
                    };

                    // Add the cell resize api if the grid is displaying columns
                    scope.api.cellResize = {
                        resync: function () { scope.colManager.refreshChildren(); refreshRenderCols(); }
                    };

                    // Attach the grid refresh method to the grid api
                    scope.api.grid.refresh = function () {
                        $timeout(function () {
                            refreshRenderRows();
                            if (scope.api.selection) {
                                var selectionApi = scope.api.selection;
                                var gridApi = scope.api.grid;

                                if (selectionApi && scope.options.selection && scope.options.selection.keepAllOnRefresh === false) {
                                    // Get a copy of the selected rows
                                    var selRows = selectionApi.getSelectedRows(true);
                                    var sel;

                                    // Loop through all of the selected rows and remove them if the grid no longer contains those rows.
                                    for (var i = 0; i < selRows.length; i++) {
                                        sel = selRows[i];
                                        if (!selectionApi.isRowInRange(sel)) {
                                            selectionApi.deselectRow(sel);
                                        }
                                    }
                                }

                                // If the selection base does not exist, use the first selected row as the base.
                                if (!selectionApi.isRowInRange(selectionApi.getFocusedRow()) || !selectionApi.isRowInRange((selectionApi.getShiftBaseRow()))) {
                                    selectionApi.updateBaseFull(selectionApi.getSelectedRows()[0]);
                                }
                            }

                            // The callback for when the grid data is finally rendered
                            if (scope.options.onDataRendered) {
                                scope.options.onDataRendered();
                            }
                        });
                    };

                    // Scroll the grid up and down
                    scope.api.grid.scrollTop = function (pos) {
                        var result;
                        if (pos === undefined) {
                            result = $viewPort.scrollTop();
                        }
                        else {
                            scope.viewWindowRows.setSavedScroll(pos);
                            result = $viewPort.scrollTop(pos);
                        }
                        return result;
                    };

                    // Scroll the grid left and right
                    scope.api.grid.scrollLeft = function (pos) {
                        var result;
                        if (pos === undefined) {
                            result = $viewPort.scrollLeft();
                        }
                        else {
                            scope.viewWindowCols.setSavedScroll(pos);
                            result = $viewPort.scrollLeft(pos);
                        }
                        return result;
                    };

                    // If a data source exist, watch for data changes
                    if (scope.datasource) {
                        scope.$watch('datasource.getData()', function () {
                            scope.api.grid.setData(scope.datasource.getData());
                            scope.datasource.doGridLoadCallback();
                        });
                    }

                    // If the onRegister function is defined, send the api to the user
                    if (scope.options.onRegister) {
                        scope.options.onRegister(scope.api);
                    }
                }

                function doGridWatch() {
                    scope.$watch('hasRenderCols()', function () {
                        refreshRenderBlocks();

                        $timeout(function () {
                            resizeViewport();
                            refreshFixedColsEl();
                            scope.viewWindowCols.updateHeaders();
                        });
                    });

                    scope.$watch('getVisibleColumns()', function () {
                        scope.colManager.setChildData(scope.getVisibleColumns());
                        refreshRenderCols();
                    });

                    /*scope.$watch('api.grid.getData()', function () {
                        refreshRenderRows(scope.api.grid.getData());
                    });*/
                }

                function doGridEvents() {
                    // update the viewport, cols, and rows whenever the window is resized
                    element.css('position', 'relative');
                    var oldHeight = $window.innerHeight;
                    windowEl.on('resize', scope.api.grid.resizeViewport);

                    // Update the visible columns and rows on scroll
                    $viewPort.on('scroll', function (evt) {
                        // update the header container based on the scroll position
                        if (scope.hasRenderCols()) {
                            scope.viewWindowCols.updateHeaders();
                        }

                        // Moves the fixed columns rows with the vertical scroller
                        if (scope.options.fixedCols && scope.options.fixedCols) {
                            scope.viewWindowRows.updateHeaders();
                        }

                        if (scope.viewWindowRows) {
                            //isUpdatedY = viewWindowRows.updateRenderData();
                            scope.viewWindowRows.updateRenderData(true);

                            // Moves the fixed columns rows with the vertical scroller
                            if (scope.options.fixedCols && scope.options.fixedCols) {
                                scope.viewWindowRows.updateHeaders();
                            }
                        }

                        // Check the columns if they are loaded
                        if (scope.hasRenderCols()) {
                            scope.viewWindowCols.updateRenderData(true);
                            // update the header container based on the scroll position
                            scope.viewWindowCols.updateHeaders();
                        }
                        scope.$digest();
                    });

                    // Implement the column resizing logic
                    if (scope.options.resizeColumns === undefined || scope.options.resizeColumns) {

                        // The mouse window functions
                        var mouseMoveColDrag;
                        var mouseUpColDrag;

                        var currentWidth;
                        var nextWidth;
                        var colDragEl;
                        var colDragElNext;
                        var initColWidth;
                        var initNextWidth;
                        var colDragIndex; // The full index of the column that is targeted
                        var colResizeTracker = angular.element(element[0].getElementsByClassName('crm-grid-col-resize-tracker'));
                        $colHeaders.on('mousedown', function (event) {
                            var $mainTarget = angular.element(event.target);
                            colDragEl = undefined; // Reset the column that is being dragged
                            colDragIndex = -1;
                            if (scope.hasRenderCols() && $mainTarget.hasClass('resize-handle')) {

                                // Now iterate through all of the col headers and find the the intersecting header
                                //var allHeaders = $colHeaders.find('.crm-grid-col-header');

                                colDragEl = $mainTarget.parent();
                                colDragElNext = colDragEl.next();

                                // Reset the widths
                                initColWidth = currentWidth = getColWidthByMouse(colDragEl, event);
                                initNextWidth = getColWidthByMouse(colDragElNext, event);

                                // Get the index of the column by passing the right side of the column
                                colDragIndex = parseInt(colDragEl.attr('data-index'));

                                // Make the tracker visible whenever a column is targeted
                                $crmGrid.addClass('resizing-col');
                                colResizeTracker.outerHeight($colHeadersContainer.outerHeight() + $viewPort.outerHeight());
                                colResizeTracker.css('left', (scope.viewWindowCols.getBlockByIndex(colDragIndex).getEnd() - $viewPort.scrollLeft() + scope.api.grid.getFixedColsWidth()) + 'px');
                                colResizeTracker.removeClass('ngHide');
                                event.preventDefault();
                            }

                        });

                        // Tracks what the width should be for the current column that is being resized
                        mouseUpColDrag = function (event) {
                            if (scope.hasRenderCols()) {
                                // Resize the column when the mouse is released only if a column is selected for resizing
                                if (colDragEl) {
                                    // Update the column widths and hide the resize column tracker
                                    var colDrag = scope.viewWindowCols.getBlockByIndex(colDragIndex);
                                    colDrag.setSize(currentWidth);
                                    colDrag.data.size = currentWidth;

                                    $crmGrid.removeClass('resizing-col');
                                    $timeout(function () {
                                        scope.api.cellResize.resync();
                                        //scope.$digest();
                                        colResizeTracker.addClass('ngHide');
                                        if (scope.options.onColumnResizeDone) {
                                            scope.options.onColumnResizeDone(colDrag.data.value, colDrag.getSize());
                                        }
                                    });

                                    colDragEl = undefined;
                                    colDragElNext = undefined;
                                }
                            }
                        };

                        mouseMoveColDrag = function (event) {
                            if (scope.hasRenderCols()) {
                                if (colDragEl) {
                                    var colDragData = scope.viewWindowCols.getBlockByIndex(colDragIndex);
                                    //var colDragRight = colDrag.outerWidth();
                                    var colDragLeft = colDragEl.offset().left;

                                    currentWidth = getColWidthByMouse(colDragEl, event);

                                    // Do the boundary check for the column widths
                                    // Make sure the column is not dragged past the container limit
                                    var colPosRelToView = colDragEl.offset().left - scope.viewWindowCols.getViewPortOffset().left;
                                    /*if (colPosRelToView + currentWidth > scope.viewWindowCols.$viewPort.outerWidth()) {
                                        currentWidth = scope.viewWindowCols.$viewPort.outerWidth() - colPosRelToView;
                                    }*/

                                    // Make sure the column is not dragged past the containers left
                                    if (currentWidth + colPosRelToView <= 0) {
                                        currentWidth = -colPosRelToView;
                                    }

                                    // Make sure the column is no smaller than the set minimum width
                                    if (currentWidth < dragMinColWidth) {
                                        currentWidth = dragMinColWidth;
                                    }

                                    // Update the column resize tracker position
                                    colResizeTracker.css('left', (colDragData.getPos() + currentWidth - $viewPort.scrollLeft() + scope.api.grid.getFixedColsWidth()) + 'px');
                                }
                            }
                        };

                        windowEl.on('mouseup', mouseUpColDrag);
                        windowEl.on('mousemove', mouseMoveColDrag);

                        // Utility function for the column resizing
                        function getColWidthByMouse(col, event) {
                            if (col && col.length) {
                                return event.pageX - col.offset().left;
                            }
                        }
                    }

                    // Destroy all of the window events
                    scope.$on('$destroy', function () {
                        if (mouseMoveColDrag) {
                            windowEl.off('mousemove', mouseMoveColDrag);
                            windowEl.off('mouseup', mouseUpColDrag);
                        }

                        windowEl.off('resize', scope.api.grid.resizeViewport);
                    });
                }

                // This does a full refresh of the columns
                function refreshRenderCols() {
                    refreshRenderBlockManager(true);
                    /*// If the columns are hidden pass block cols to the getViewBlocks function
                    if (!scope.api.grid.isColumnsVisible()) {
                        cols = [];
                    }

                    // Get the new set of columns and update the view window for the columns
                    if (cols && cols.length) {
                        var colData = getViewBlocks(scope, cols, scope.options.colWidth, undefined, minColWidth);
                        scope.setCols(colData.data);
                        scope.viewWindowCols.updateRenderData(true);
                        scope.viewWindowCols.updateHeaders();
                    }
                    else {
                        /// Reset the content size to the full*-width if there are no columns
                        scope.viewWindowCols.renderedData = [];
                        scope.viewWindowCols.resyncSize();
                    }*/
                }

                // Refreshes the desired row or col manager and view window
                function refreshRenderBlockManager(isCols) {
                    var manager = scope.rowManager;
                    var window = scope.viewWindowRows;

                    // Refresh should be down for columns
                    if (isCols) {
                        manager = scope.colManager;
                        window = scope.viewWindowCols;
                    }

                    if (manager) {

                        window.updateRenderData(true);

                        // Update the data that is in the selected rows
                        /*if(scope.api.selection && !isCols){
                            // This inserts the appropriate grid data into the selected row
                            scope.api.selection.refresh();
                        }*/
                    }

                    // Size the view window based on the block managers content
                    //viewWindowRows.resyncSize();
                }

                // This does a full refresh of the rows
                function refreshRenderRows() {

                    refreshRenderBlockManager();
                }

                // The refresh function
                function refreshRenderBlocks() {

                    /*
                    {
                        data: resultData,
                        maxSize: maxSize,
                        minSize: minSize,
                        hasDiffSize: hasDiff,
                        totalSize: totalSize
                    };
                    */

                    refreshRenderCols();
                    refreshRenderRows();

                }

                // This gets a view window object. There should only be two view window objects. There should be one for scrolling the rows and another for scrolling the columns
                function createViewWindow(manager, opts) {

                    // Throw an error if the block manager is not present
                    if (!manager) {
                        throw new Error("The view window cannot be instaniated without a block manager.");
                    }

                    // The passed in options
                    opts = opts || {};

                    // --- Private data members
                    var _$viewPortEl = opts.viewPortEl || $viewPort; // The view port. This is used for scrolling the content
                    var _$contentEl = opts.contentEl || $content; // The content container that holds all of the rows
                    var _savedScroll = 0; // Saves the scroll position for the window

                    // This saves the settings to use with the upateRenderData function
                    var _renderDataSettings = {
                        buffStart: 2, // The number of blocks to hide under the starting portion of the view port
                        buffEnd: 2, // The number of blocks to hide under the ending portion of the view port
                        startBreakAt: undefined, // Whenever the new start row is less than this block a new set of blocks will be loaded
                        endBreakAt: undefined, // Whenever the new end row is greater than this block a new set of blocks will be loaded
                        endBlock: undefined,  // Saves the state of the end block before an update is required
                        startBlock: undefined // Saves the state of the start block before an update is required
                    };

                    var _blockManager = manager;
                    var _blocksInManager = [];

                    // The offset for scrolling the window
                    var _headerOffset;

                    // -- Public methods to be returned
                    var publicMethods = {
                        // -- The methods that have to be defined based on the block manager type
                        scrollToBlock: undefined, // Scrolls to the passed in grid block
                        scrollToByIndex: undefined,
                        getBlockByCurrentScrollPosition: undefined, // Gets the block based on the current position of the scrollbar
                        //setContentSize: undefined, // Sets the size of the content that resides in the view port
                        resizeWindowToManager: undefined, // Sets the size of the content element to the block managers size. This is the total size of all blocks that should be rendered
                        getViewPortSize: undefined, // Gets the size of the view port
                        getStart: undefined, // Returns the number of pixels of the contents top/left. This is relative to the view port
                        getEnd: undefined, // Returns the number of pixels of the contents bottom/right. This is relative to the view port

                        // -- Define the shared functionality
                        // Gets the a block based on the passed in scroll position
                        getBlockByScrollPosition: function (scrollPos) {
                            return _blockManager.getBlockByScrollPosition(scrollPos);
                        },
                        // Gets the smallest block size contained by the manager
                        getMinBlockSize: function () {
                            return _blockManager.getContainerData('minSize');
                        },
                        getViewPortOffset: function(){
                            return _$viewPortEl.offset();
                        },
                        // Gets the largest block size contained by the manager
                        getMaxBlockSize: function () {
                            return _blockManager.getContainerData('maxSize');
                        },
                        // Gets the size of the content that gets srolled by the viewport
                        getContentSize: function () {
                            return _blockManager.getContainerData('totalSize');
                        },
                        // Get the blocks that are stored in the block manager
                        getBlocks: function(){
                            return _blocksInManager;
                        },
                        // This clone the current blocks that belong to the underlying block manager
                        saveBlocksFromManager: function(){
                            _blocksInManager = [];
                            for (var i = 0; i < _blockManager.getChildrenCount() ; i++) {
                                _blocksInManager[_blocksInManager.length] = _blockManager.getChildByIndex(i);
                            }
                        },
                        // Get a block from the block manager by index
                        getBlockByIndex: function(index){
                            return _blockManager.getChildByIndex(index);
                        },
                        // Set the window's saved scroll position (Helps to prevent the scroll bar from resetting when new data is set)
                        setSavedScroll: function (s) {
                            _savedScroll = s;
                        },
                        // Get the window's saved scroll position (Helps to prevent the scroll bar from resetting when new data is set)
                        getSavedScroll: function () {
                            this._savedScroll;
                        },
                        // Determines if there are any blocks in the manager
                        hasBlocks: function () {
                            return _blockManager.getChildrenCount() > 0 ? true : false;
                        },
                        // Gets the block that are n blocks away from the passed in block
                        getBlockByBlocksFrom: function (block, count, findAll, includeFrom) {
                            return getBlockByBlocksFrom(block, count, findAll, includeFrom);
                        },
                        updateRenderData: function (forceRefresh) {
                            updateRenderData(publicMethods, _renderDataSettings, forceRefresh);
                        }
                    };

                    // Add the vertical scrolling properties and methods
                    if (_blockManager.getType() == 'row') {
                        var $fixedColsContainerEl = opts.fixedColsContainerEl || $fixedColsContainer;

                        publicMethods.scrollToBlock = function (scrollBlock) {
                            scrollToBlock(scrollBlock, _$viewPortEl, _$contentEl, true);
                        };

                        publicMethods.getBlockByCurrentScrollPosition = function () {
                            return _blockManager.getBlockByScrollPosition(_$viewPortEl.scrollTop());
                        };

                        publicMethods.resizeWindowToManager = function () {
                            // Sets the size of the content based on the blockManager. This include all blocks even if they haven't been rendered yet
                            if (_blockManager.getContainerData('totalSize') !== undefined && _blockManager.getChildrenCount() > 0) {
                                _$contentEl.outerHeight(_blockManager.getContainerData('totalSize') + 'px');
                            }
                            else {
                                _$contentEl.css('height', 'auto');
                            }
                        };

                        publicMethods.getViewPortSize = function () {
                            return _$viewPortEl.outerHeight();
                        };

                        publicMethods.getStart = function () {
                            return getViewTop(_$viewPortEl, _$contentEl);
                        };

                        publicMethods.getEnd = function () {
                            return getViewBottom(_$viewPortEl, _$contentEl);
                        };

                        publicMethods.updateHeaders = function () {
                            // This is the container for columns that should be immovable
                            $fixedColsContainer.css('top', -_$viewPortEl.scrollTop() + 'px');
                        };

                    }
                    else {  // Add the horizontal scrolling properties and methods
                        publicMethods.scrollToBlock = function (scrollBlock) {
                            scrollToBlock(scrollBlock, _$viewPortEl, _$contentEl, false);
                        };

                        publicMethods.getBlockByCurrentScrollPosition = function () {
                            return _blockManager.getBlockByScrollPosition(_$viewPortEl.scrollLeft());
                        };

                        publicMethods.resizeWindowToManager = function () {
                            // Sets the size of the content based on the blockManager. This include all blocks even if they haven't been rendered yet
                            if (_blockManager.getContainerData('totalSize') !== undefined && _blockManager.getChildrenCount() > 0) {
                                _$contentEl.outerWidth(_blockManager.getContainerData('totalSize') + 'px');
                            }
                            else {
                                _$contentEl.css('width', 'auto');
                            }
                        };

                        publicMethods.getViewPortSize = function () {
                            return _$viewPortEl.outerWidth();
                        };

                        publicMethods.getStart = function () {
                            return getViewLeft(_$viewPortEl, _$contentEl);
                        };

                        publicMethods.getEnd = function () {
                            return getViewRight(_$viewPortEl, _$contentEl);
                        };

                        publicMethods.updateHeaders = function () {
                            if (this.renderedData) {
                                // update the header container based on the scroll position
                                var firstCol = this.renderedData[0];
                                // Update the column headers with the horizontal scrollbar only if there are columns present
                                if (firstCol) {
                                    $colHeaders.css('left', (firstCol.getPos() - _$viewPortEl.scrollLeft() + scope.api.grid.getFixedColsWidth()) + 'px');
                                }
                            }
                        };
                    }

                    // Return the final set of public accessible methods
                    return publicMethods;
                }
            },
            controller: function ($scope) {
                $scope.options = $scope.crmGrid;

                // Gets a default options object
                function getDefaultOptions(){
                    return {
                        blockOptions: {
                            rows: {
                                size: undefined
                            },
                            cols: {
                                size: undefined
                            },
                        },
                        sort: false
                    };
                }

                // Get the grid options and default them
                var def = getDefaultOptions();
                $scope.options = $scope.options || def;
                $scope.options.data = $scope.options.data || [];
                $scope.options.blockOptions = returnSourceOrDefault($scope.options, def, 'blockOptions');
                $scope.options.blockOptions.rows = returnSourceOrDefault($scope.options, def, 'blockOptions.rows');
                $scope.options.blockOptions.cols = returnSourceOrDefault($scope.options, def, 'blockOptions.cols');
                $scope.options.blockOptions.rows.size = returnSourceOrDefault($scope.options, def, 'blockOptions.rows.size');
                $scope.options.blockOptions.cols.size = returnSourceOrDefault($scope.options, def, 'blockOptions.cols.size');
                $scope.options.sort = returnSourceOrDefault($scope.options, def, 'sort');
                var doSortAction;
                var onAfterSortClick;
                var onBeforeSortClick;
                if (typeof $scope.options.sort == 'object') {
                    doSortAction = $scope.options.sort.doSortAction;
                    onAfterSortClick = $scope.options.sort.onAfterSortClick;
                    onBeforeSortClick = $scope.options.sort.onBeforeSortClick;
                }
                this.options = $scope.options;

                // Get the datasource if it exist
                $scope.datasource = $scope.options.datasource;

                // Create the pager if the user elects to enable it
                if ($scope.options.hasPager) {
                    $scope.pager = crmGridPager.create();
                    $scope.pager.setDataSource($scope.datasource);

                    $scope.onPagerRegister = $scope.options.onPagerRegister || function () { };;
                }

                var gridClassesFactory = crmGridClasses.createGridClassesFactory($scope.options);
                // Manages all of the rows that are currently visible
                var rowManager = gridClassesFactory.createBlockManager('row');
                var colManager = gridClassesFactory.createBlockManager();
                var fixedColManager = gridClassesFactory.createBlockManager();

                $scope.rowManager = rowManager;
                $scope.colManager = colManager;
                $scope.fixedColManager = fixedColManager;

                var selectionApi = gridClassesFactory.getSelectionApi();

                // Add a selection manager to the row manager
                if(selectionApi){
                    var selectionManager = crmGridSelectionManager.create($scope.options.selection);
                    selectionManager.setRowManager(rowManager);
                    rowManager.test ="Gotcha"
                    rowManager.setSelectionManager(selectionManager);
                }

                // This is the private container data that should be kept with each manager
               // var privateConData = {};

                var rowData;
                var colData;

                var rows;
                var cols;
                
                colData = [];
                var avFields;
                var avFieldsMap = {};
                var avFieldTempCount = {};
                var defaultWidths = []; // Stores the default width of the column

                var curSort = [];

                var rowHeight;

                // Determines if columns are turned on for rendering
                var colsOn = $scope.options.showCols;

                // The row data that is passed in from a application
                var data = [];

                $scope.minWidth = $scope.options.minWidth;

                var gridLinesOn = $scope.options.showGridLines === undefined ? true : $scope.options.showGridLines;

                function setManagerData(manager, data){
                    // Process the blocks if there is data
                    if (data && data.length > 0) {

                        var curBlock;

                        // Build the blocks that should be in the viewer
                        for (var i = 0; i < data.length; i++) {
                            // Get the view block to process based on the blockType
                            curBlock = getBlock({defaultSize: defaultSize, minSize: udfMinSize, hashKey: hashKey, data: data, index: i, blockType: manager.getType(), rowMapAccessor: rowMapAccessor});
                            curBlock.setData(blockData);

                            // The block cannot be smaller than the minimum size
                            if (udfMinSize !== undefined && curBlock.getSize() < udfMinSize) {
                                curBlock.setSize(udfMinSize);
                            }

                            // Update the position of the current block and size of the current container
                            updateContainerAndBlock(curBlock);

                            // Add the current block to the manager if it is visible
                            if(curBlock.isVisible()){
                                manager.addChild(curBlock);
                            }
                        }
                    }
                }

                function getNestedRowByKey(parent, key, resArr){
                    var result;
                    var curRow;
                    if(parent){

                        // Loop through all of the children to find the row with the matching hash key
                        var curRow;
                        for(var i = 0; i < parent.getChildrenCount() && (!result || resArr); i++){
                            curRow = parent.getChildByIndex(i);

                            // Check to see if the row is equal
                            if(curRow.getHash() == key){
                                result = curRow;
                                // Add the results to the passed in array if it exist
                                if (resArr) {
                                    resArr[resArr.length] = result;
                                }
                            }

                            // Check to see if there are children
                            if ((!result || resArr) && curRow.getChildrenCount() > 0) { // Drill into the row if it has children
                                result = getNestedRowByKey(curRow, key, resArr);
                            }
                            
                        }
                    }

                    // Returns the last result found
                    return result;
                }

                // This method is only avialable to the crm grid
                $scope.getVisibleColumns = function () {
                    return colData;
                };

                // Clone the selection api and remove methods that should not be exposed to the public
                if (selectionApi) {
                    var selectionApi = angular.extend({}, selectionApi);
                    selectionApi.addManager = undefined;
                    selectionApi.setManagers = undefined;
                    selectionApi.removeAllManagers = undefined;
                    selectionApi.removeManager = undefined;
                }

                // Do the initial api set up
                $scope.api = this.api = {
                    selection: selectionApi,
                    grid: {
                        getNestedDepth: function (row) {
                            var nestedDepth = 0;
                            iterRow = row.getParent();
                            while (iterRow && iterRow.getParent()) {
                                iterRow = iterRow.getParent();
                                nestedDepth++;
                            }

                            return nestedDepth;
                        },
                        // Updates the key that rows should be based on
                        setRowKey: function(rowKey){
                            rowManager.setHashKey(rowKey);

                            // When changing the row key for a row, the selection api should also be updated if it exist
                            if (selectionApi) {
                                selectionApi.setRowKey(rowKey);
                            }
                        },
                        getRowKey: function(){
                            return rowManager.getHashKey();
                        },
                        getSelectionManager: function(){
                            return selectionManager;
                        },
                        hasGridLines: function(){
                            return gridLinesOn;
                        },
                        getRowByScrollPosition: function(scrollPos){
                            return rowManager.getBlockByScrollPosition(scrollPos);   
                        },
                        scrollToRow: function(row){
                            $scope.viewWindowRows.scrollToBlock(row);
                        },
                        setGridLinesVisible: function(v){
                            gridLinesOn = v;
                        },
                        getFieldByIndex: function (index) {
                            return avFields[index];
                        },
                        getFieldByName: function(name){
                            return avFieldsMap[name];
                        },
                        setRowHeight: function (height) {
                            if (rowHeight != height) {
                                rowHeight = height;
                                this.refresh();
                            }
                        },
                        getRowHeight: function(){
                            return rowHeight;
                        },
                        sort: function (newSort) {
                            if ($scope.options.sort) {
                                if (newSort) {
                                    curSort = newSort;
                                }

                                if (!doSortAction && rowData && curSort && curSort.length > 0) {
                                    rowData.sort(function (a, b) {
                                        return getMultiSortValue(a, b, curSort);
                                    });
                                }
                                else if (doSortAction) {
                                    doSortAction($scope.api);
                                }

                                // Update the rows and then call refresh to update the grid
                                rowManager.setChildData(rowData);
                                this.refresh();
                            }
                        },
                        setData: function (data, newSort) {
                            // Set the new data
                            rowData = data || [];
                            // If the sort exist then call the sort method otherwise just do a refresh
                            if ($scope.options.sort) {
                                if (newSort) {
                                    curSort = newSort;
                                }

                                if (curSort) {
                                    if (doSortAction) {
                                        rowManager.setChildData(rowData);
                                        doSortAction($scope.api);
                                        this.refresh();
                                    }
                                    else {
                                        this.sort();
                                    }
                                }
                            }
                            else {
                                // Update the rows and then call refresh to update the grid
                                rowManager.setChildData(rowData);
                                this.refresh();
                            }

                            $scope.api.cellResize.resync();
                        },
                        getSortByField: function (val) {
                            val = (val || '').toLocaleLowerCase();
                            var found;
                            for (var i = 0; i < curSort.length && !found; i++) {
                                if (val == curSort[i].by) {
                                    found = curSort[i];
                                }
                            }

                            return found || {by: val, dir: ''};
                        },
                        getSortDirByField: function(val){
                            var obj = this.getSortByField(val);
                            var dir = '';
                            if (obj) {
                                dir = (obj.dir || '').trim().toLocaleLowerCase();
                            }
                            return dir;
                        },
                        hardRefresh: function(){
                            rowManager.refreshChildren();
                            this.refresh();
                        },
                        refresh: function(){},
                        getData: function () {
                            return rowData;
                        },
                        /*getRows: function(){
                            return rows;
                        },
                        getRowIndexByKey: function(key){
                            var allRows = this.getRows();
                            var index;

                            for (var i = 0; i < allRows.length && index === undefined; i++) {
                                if (allRows[i].hash == key) {
                                    index = i;
                                }
                            }

                            return index;
                        },*/
                        getRowCount: function(){
                            return rowManager.getChildrenCount();
                        },
                        getRowByIndex: function(index){
                            return rowManager.getChildByIndex(index);
                        },
                        getRowByAbsoluteIndex: function(index){
                            return findBlockByAbsoluteIndex(index, rowManager);
                        },
                        getRowsByKey: function (key, deepObj) {
                            var result = [];
                            // Only check the root rows of the grid
                            if (!deepObj) {
                                result = rowManager.getChildByKey(key);
                                if (result) {
                                    result = [result];
                                }
                                else {
                                    result = [];
                                }
                            }
                            else { // Do a nested check for all rows
                                if (typeof deepObj == 'object') { // Start at a different parent level
                                    getNestedRowByKey(deepObj, key, result);
                                }
                                else {
                                    getNestedRowByKey(rowManager, key, result); // Start at the root parent
                                }
                            }

                            return result;
                        },
                        setVisibleColumns: function (indices, restoreWidthOnHide) { // Array of indices to display
                            // Deep copy the col properties
                            //template, value, getText, isHidden, width
                            colData = [];
                            visColIndices = [];
                            var index;
                            var dupMap = {};

                            // Add the visible columns to the col data
                            for (var i = 0; i < indices.length; i++) {
                                index = indices[i];

                                // Check for duplicates and for a present fields
                                if (!dupMap[index] && avFields[index]) {
                                    dupMap[index] = true;
                                    colData[colData.length] = avFields[index];
                                    visColIndices[visColIndices.length] = index;
                                }
                            }

                            // Specifies whether the columns width should be restored when they are hidden
                            if (restoreWidthOnHide) {
                                // Reset the width of any columns that are hidden
                                for (var i = 0; i < avFields.length; i++) {
                                    // If the field has been added reset the width
                                    if (!dupMap[i]) {
                                        avFields[i].size = defaultWidths[i];
                                    }
                                }
                            }
                        },
                        getColumnByIndex: function(index){
                            return avFields[index];
                        },
                        getColumnCount: function(){
                            return avFields.length;
                        },
                        getVisibleColumnByIndex: function(index){
                            return colData[index];
                        },
                        getVisibleColumnCount: function(){
                            return colData.length;
                        },
                        getVisibleColumnIndices: function () {
                            return visColIndices;
                        },
                        setColumnsVisible: function (on) {
                            colsOn = on;
                        },
                        isColumnsVisible: function () {
                            return colsOn;
                        },
                        getPager: function () {
                            return $scope.pager;
                        },
                        createBlock: function(opts){
                            return gridClassesFactory.createCrmGridBlock(opts);
                        },
                        setFields: function (newFields) {
                            colData = [];
                            visColIndices = [];
                            avFields = undefined;
                            avFieldsMap = {};
                            avFieldTempCount = {};
                            defaultWidths = []; // Stores the default width of the column

                            if (newFields) {
                                // Make a deep copy of the passed in table fields so that crm grid doesn't affect the entire app
                                avFields = copyFieldData(newFields, function (field, index, privateFields) {
                                    // Copy the initial set of visible columns
                                    if (!privateFields.isHidden) {
                                        colData[colData.length] = field;
                                        visColIndices[visColIndices.length] = index;
                                    }

                                    // The field name should append a count if it already exist
                                    if (!avFieldsMap[field.value]) {
                                        avFieldTempCount[field.value] = 1;
                                        avFieldsMap[field.value] = field;
                                    }
                                    else {
                                        avFieldTempCount[field.value]++;
                                        var count = avFieldTempCount[field.value];
                                        avFieldsMap[field.value + count] = field;
                                    }

                                    // Save the default size for a column (This allows you to revert to the original column size)
                                    defaultWidths[defaultWidths.length] = privateFields.defaultSize || field.size;
                                });
                            }
                            else {
                                // TODO: default columns here
                            }
                        }
                    }
                };

                $scope.getRowCount = $scope.api.getRowCount;
                $scope.getRowIndexByKey = $scope.api.getRowByIndex;

                $scope.getRows = this.getRows = function () {
                    return rowManager.blocks;
                };

                $scope.getCols = this.getCols = function () {
                    return cols;
                };

                $scope.setCols = this.setCols = function (d) {
                    cols = d;
                };

                $scope.hasRenderCols = function () {
                    var options = $scope.options;
                    return $scope.api.grid.isColumnsVisible() && $scope.getVisibleColumns() && $scope.getVisibleColumns().length > 0;
                };

                $scope.isColumnsVisible = function () {
                    return $scope.api.grid.isColumnsVisible();
                };

                $scope.getSortByField = function (val) {
                    return $scope.api.grid.getSortByField(val);
                };

                $scope.getSortDirByField = function (val) {
                    return $scope.api.grid.getSortDirByField(val);
                };

                $scope.doSingleSort = function (val) {
                    var sortObj = $scope.getSortByField(val);
                    var defaultSortDir = 'asc';

                    // An event that occurs before the click logic is executed
                    if (onBeforeSortClick) {
                        onBeforeSortClick($scope.api, { by: sortObj.by, dir: sortObj.dir });
                    }

                    // If the sort object has no direction are is descending toggle to ascending
                    if (sortObj.dir == '' || sortObj.dir == 'desc') {
                        sortObj.dir = defaultSortDir;
                    }
                    else { // Otherwise toggle to descending
                        sortObj.dir = 'desc'
                    }

                    // If the sort object is present complete the sort
                    if (sortObj) {
                    	// Timeout needed to prevent the ui thread from being blocked. This will queue the sort so any rendering can happen first.
                    	$timeout(function(){
                    		$scope.api.grid.sort([sortObj]);
	                        if (onAfterSortClick) {
	                            onAfterSortClick($scope.api, {by: sortObj.by, dir: sortObj.dir});
	                        }
                    	});
                    }
                };

                $scope.isSortEnabled = function () {
                    return $scope.options.sort;
                };

                $scope.isColumnSortEnabled = function (col) {
                    return col.sort !== false;
                };

                // Set the initial row height
                rowHeight = $scope.options.rowHeight;

                // Set the initial fields
                $scope.api.grid.setFields($scope.options.fields);

            },
            //templateUrl: 'lib/base/crmGrid.html',
            templateUrl: 'crm.grid',
            priority: 0,
        };
    }])
    .directive('crmGridSelection', ['crmGridSelectionApi', function (crmGridSelectionApi) {
        return {
            priority: 1,
            require: '^crmGrid',
            link: function (scope, element, attrs, controllerGrid) {

                var $viewPort = angular.element((element[0].getElementsByClassName('crm-grid-viewport')[0])); // The view port

                var options = controllerGrid.options;

                // An api instance for this selection directive
                //var selectionApi = controllerGrid.api.selection = crmGridSelectionApi.createApi(controllerGrid, $viewPort);
                var selectionApi = controllerGrid.api.selection;
                var gridApi = controllerGrid.api.grid;

                // Create the selection logic only if it is enabled
                if (options.enableSelection === false) {
                    return;
                }

                // The key codes
                var key_left = 37;
                var key_up = 38;
                var key_right = 39;
                var key_down = 40;

                var rowIndexAttr = 'data-index';

                options.selection = options.selection || {};
                var selectionOptions = options.selection;

                if (selectionOptions.singleClickClear === undefined) {
                    selectionOptions.singleClickClear = true;
                }

                if (selectionOptions.autoScrollFocus === undefined) {
                    selectionOptions.autoScrollFocus = true;
                }

                selectionOptions.commandDone = selectionOptions.commandDone || function () { };
                selectionOptions.validateSelectionCycle = selectionOptions.validateSelectionCycle || function () { return true; };
                selectionOptions.beforeClick = selectionOptions.beforeClick || function ($this, index, $target) { return true; };
                selectionOptions.beforeKeyDown = selectionOptions.beforeKeyDown || function (key) { return true; };

                var clearAllSelections = function () { selectionApi.fullClearAll(); };

                // If the clearAllVisibleOnly is set to true, the grid should only clear the rows that are currently loaded into the grid
                if (selectionOptions.clearAllVisibleOnly) {
                    clearAllSelections = function () { selectionApi.clearAll(); };
                }

                // The scroll container
                var $content = angular.element((element[0].getElementsByClassName('crm-grid-scroll-container')[0]));
                var rowClass = 'crm-grid-row';

                var selectedClass = 'selected';
                var $shiftBase = undefined;
                var $curArrowBase = undefined;
                var isCtrlAndShiftClick = false;
                var arrowDir;
                var $iterArrow = undefined;
                var $clickedRow;

                function makeTabable() {
                    $viewPort.attr('tabindex', 0);
                }

                makeTabable();

                // Utility Functions

                // Gets the dom representation of the row
                /*function getItemEl(index) {
                    return $viewPort.find('[' + rowIndexAttr + '="' + index + '"]');
                }*/

                function clearShiftBase() {
                    selectionApi.updateShiftBase(-1);
                    arrowDir = undefined;
                    selectionApi.setBaseClickChanged(false);
                    isCtrlAndShiftClick = false;
                }

                function resetAll() {
                    clearShiftBase();
                    makeTabable();
                }

                $viewPort.on('keydown', function (evt) {
                    // The user can only move up or down
                    var isKeyValid = evt.which == key_down || evt.which == key_up;
                    evt.preventDefault();
                    if (isKeyValid) {

                        // Trigger the before key down event
                        var beforeKeyDownReturn = selectionOptions.beforeKeyDown(evt.which);
                        if (beforeKeyDownReturn === false) {
                            return;
                        }

                        // If the selections update is being tracked, get the selections before making new selections
                        var prevSelections;
                        if (selectionOptions.onSelectionUpdate) {
                            prevSelections = selectionApi.getSelectedRows();
                        }

                        var curRow;
                        var scrollRow = selectionApi.getFocusedRow();

                        // Default the row if it does not exist
                        if (!scrollRow) {
                            curRow = scrollRow = selectionApi.getFirst();
                        }
                        else {
                            if (scrollRow) {
                                scrollRow = evt.which == key_down ? getBlockByBlocksFrom(selectionApi.getFocusedRow(), 1, false, false)[0] : getBlockByBlocksFrom(selectionApi.getFocusedRow(), -1, false, false)[0];
                            }

                            // go to the next/prev row else stay on the same row, Handles arrow tracking
                            if (arrowDir == evt.which || arrowDir == undefined || !evt.shiftKey || !selectionOptions.multiSelect) {
                                curRow = scrollRow;
                            }
                            else {
                                curRow = selectionApi.getFocusedRow();
                            }
                        }

                        // update the travel direction
                        arrowDir = evt.which;

                        // Make sure the row that the user wants to move to is within range
                        if (curRow && selectionApi.isRowInRange(curRow) && selectionOptions.validateSelectionCycle(curRow)) {

                            // Wipeout the uneeded rows from the shift click
                            if (scope.isCtrlAndShiftClick && evt.shiftKey) {

                                var startingRow = selectionApi.getFocusedRow();
                                var baseRow = selectionApi.getShiftBaseRow();

                                if (startingRow.getAbsoluteIndex() < baseRow.getAbsoluteIndex()) {

                                    // Clear all after the current shift base
                                    selectionApi.clearRange(baseRow, 1);
                                    // Clear all previous to the current control click
                                    var firstRow = gridApi.getRowByIndex(0);
                                    selectionApi.clearRange(firstRow, startingRow.getAbsoluteIndex() - 1);
                                }
                                else if (startingRow.getAbsoluteIndex() > baseRow.getAbsoluteIndex()) {

                                    // Clear all before the current shift base
                                    selectionApi.clearRange(firstRow, baseRow.getAbsoluteIndex() - 1);
                                    // Clear all after the current control click
                                    //selectionApi.clearRange(firstRow, startingRow.getAbsoluteIndex() - 1);
                                    //clearRange(index + 1);
                                }
                            }

                            isCtrlAndShiftClick = false;

                            // Go to next row
                            selectionApi.setFocusedRow(curRow);

                            // Clears all selections if the base is changed due to a click
                            if (selectionApi.isBaseClickChanged() == true) {
                                clearAllSelections();
                                selectionApi.setBaseClickChanged(false);
                            }

                            // if no shift, clear all selections and select the first
                            if (!evt.shiftKey || !selectionOptions.multiSelect) {
                                clearAllSelections();
                                selectionApi.updateShiftBaseRow(curRow);
                            }
                            else {

                                // Make sure the multi select does not disturb the current base
                                var baseRow = selectionApi.getShiftBaseRow();

                                selectionApi.selectRow(baseRow);

                                if (selectionApi.getFocusedRow() == baseRow) {
                                    scrollRow = curRow = evt.which == key_down ? getBlockByBlocksFrom(selectionApi.getFocusedRow(), 1, false, false)[0]: getBlockByBlocksFrom(selectionApi.getFocusedRow(), -1, false, false)[0];
                                }

                            }

                            // If in range update the iterIndex and perform the logic
                            if (selectionApi.isRowInRange(curRow)) {

                                // Update the current row
                                selectionApi.setFocusedRow(curRow);

                                //var $scroll = $(scope.$items[scrollRowIndex]);
                                if (selectionApi.isRowSelected(scrollRow)) {
                                    scrollRow = evt.which == key_down ? getBlockByBlocksFrom(scrollRow, 1, false, false)[0] : getBlockByBlocksFrom(scrollRow, -1, false, false)[0];
                                }

                                // Toggle the current row selection
                                selectionApi.toggleRowSelection(selectionApi.getFocusedRow());

                                // Update the scroller position
                                if (selectionOptions.autoScrollFocus) {
                                    gridApi.scrollToRow(scrollRow);
                                }
                            }
                        }

                        //scope.$apply(function () {
                            selectionOptions.commandDone();

                            // Do the selection update callback only if the callback is available and a change has been made
                            if (selectionOptions.onSelectionUpdate) {
                                if (!selectionApi.selectionsEqualTo(prevSelections)) {
                                    selectionOptions.onSelectionUpdate();
                                }
                            }
                        //});
                            scope.$digest();
                    }
                });

                // Gets the top level parent of an element
                function getTopParent(sourceEl, className, endAtEl){
                    var found;
                    var cur = sourceEl.parent();

                    while(!found && cur.length > 0 && cur != endAtEl){
                        // If the class name matches save the found element
                        if(cur.hasClass(className)){
                            found = cur;
                        }
                        else{
                            cur = cur.parent();
                        }
                    }

                    return found;
                }

                $viewPort.on('click', function (evt) {

                    var $target = angular.element(evt.target);

                    // Check to see if a row has been clicked only if the target element has not handled the click event already
                    if ($target.attr('crm-grid-handle-click') === undefined && $target.attr('data-crm-grid-handle-click') === undefined) {

                        // Check to see if the target is the row or is a child of the row
                        var $this;
                        if($target.hasClass(rowClass)){
                            $this = $target;
                        }
                        else{
                            var $topLevel = getTopParent($target, rowClass, $viewPort);
                            $this = $topLevel ? $topLevel : $target;   
                        }

                        selectionApi.updateClickedIndex(parseInt($this.attr(rowIndexAttr), 10));
                        var thisIndex = selectionApi.getClickedIndex();
                        var row = selectionApi.getClickedRow();

                        // Return if the click item is not an item
                        if (!row) {
                            return;
                        }

                        // If the selections update is being tracked, get the selections before making new selections
                        var prevSelections;
                        if (selectionOptions.onSelectionUpdate) {
                            prevSelections = selectionApi.getSelectedRows();
                        }

                        var beforeClickReturn = selectionOptions.beforeClick($this, row.getAbsoluteIndex(), $target);
                        if (beforeClickReturn === false) {
                            return;
                        }

                        var isControlOrShift = evt.shiftKey || evt.ctrlKey;

                        // Only select one if it is not a special selection key
                        if (!isControlOrShift || !selectionOptions.multiSelect) {

                            var isClickedRowSelected = selectionApi.isRowSelected(selectionApi.getClickedRow());
                            if (selectionOptions.singleClickClear || !selectionOptions.multiSelect) {
                                    clearAllSelections();
                            }

                            if(evt.ctrlKey){
                                if(isClickedRowSelected){
                                    selectionApi.deselectRow(selectionApi.getClickedRow());
                                }
                                else{
                                    selectionApi.selectRow(selectionApi.getClickedRow());   
                                }
                            }
                            else{
                                selectionApi.updateShiftBaseRow(row);
                                selectionApi.setBaseClickChanged(true);
                                selectionApi.setFocusedRow(selectionApi.getShiftBaseRow());

                                selectionApi.selectRow(row);
                            }
                        }
                        else if (evt.shiftKey) {
                            isCtrlAndShiftClick = true;

                            // Save the initial base click, if no shift base set the shift base to the first
                            if (!selectionApi.getShiftBaseRow()) {
                                selectionApi.updateShiftBaseRow(gridApi.getRowByIndex(0));
                            }

                            selectionApi.setBaseClickChanged(false);

                            var baseIndex;
                            var startIndex;
                            var endIndex

                            if(selectionApi.getShiftBaseRow()){
                                baseIndex = selectionApi.getShiftBaseRow().getAbsoluteIndex();
                            }

                            // Determine the start and end range for the local selections
                            startIndex = row.getAbsoluteIndex();
                            endIndex = baseIndex;
                            if (row.getAbsoluteIndex() > baseIndex) {
                                arrowDir = key_down; // reset the key movement orientation
                            }
                            else {
                                arrowDir = key_up; // reset the key movement orientation
                            }

                            // Loop and add the selections
                            if (!evt.ctrlKey) {
                                selectionApi.setSelectionByRange(selectionApi.getShiftBaseRow(), startIndex - endIndex, false);
                                isCtrlAndShiftClick = false;
                            }
                            else {
                                selectionApi.setSelectionByRange(selectionApi.getShiftBaseRow(), startIndex - endIndex, true);
                            }

                            selectionApi.setFocusedRow(row);
                        }
                        else if (evt.ctrlKey) {
                            selectionApi.doControlClick();
                        }

                        if (selectionOptions.autoScrollFocus) {
                            //scrollByAbsoluteIndex(thisIndex, selectionApi.getItems(), $viewPort, $content, true);
                            gridApi.scrollToRow(row);
                        }

                        scope.$apply(function () {
                            selectionOptions.commandDone();

                            // Do the selection update callback only if the callback is available and a change has been made
                            if (selectionOptions.onSelectionUpdate) {
                                if (!selectionApi.selectionsEqualTo(prevSelections)) {
                                    selectionOptions.onSelectionUpdate();
                                }
                            }
                        });
                        evt.preventDefault();
                    }
                });

                $viewPort.on('mousedown', function (evt) {
                    // disable text selection when using the shift click command
                    //if (evt.shiftKey || evt.ctrlKey) {
                    evt.preventDefault();
                    $viewPort[0].focus();
                    //evt.stopPropagation();
                    //}
                });
            }
        };
    }])
    .directive('crmGridRow', ['$compile', '$templateCache', function ($compile, $templateCache) {
        var cellHtml = $templateCache.get('crm.grid.cell'); // The indiviual cells for the show header view
        return {
            compile: function () {
                var rowOnlyLinker;
                var customRowCellLinker;
                var normalRowCellLinker;
                
                return {
                    post: function (scope, element, attrs, controllers) {
                        if (scope.options.rowClass) {
                            element.addClass(scope.options.rowClass);
                        }

                        var blockOptions = scope.options.blockOptions[scope.row.getBlockOptionsName() || 'rows'];

                        if (!scope.hasRenderCols()) { // Get the appropriate html for the standard row view
                            var rowTemplate = blockOptions.rowTemplate || scope.options.rowTemplate;
                            if(rowTemplate){
                                if (!rowOnlyLinker) {
                                    rowOnlyLinker = $compile(angular.element(rowTemplate));
                                }

                                element.append(rowOnlyLinker(scope, function (clone) {
                                    return clone;
                                }));
                            }
                        }
                        else { // Get the appropriate html for the header (non fixed cols) view
                            var rowCellTemplate = blockOptions.rowCellTemplate || scope.options.rowCellTemplate;
                            if (rowCellTemplate) { // Add the template
                                if (!customRowCellLinker) {
                                    // Turn the template into an element
                                    var rowTemplateEl = angular.element(rowCellTemplate);

                                    // Add the cell html to the new row element
                                    rowTemplateEl.html(cellHtml);

                                    // Do the final compile
                                    customRowCellLinker = $compile(rowTemplateEl);
                                }

                                element.append(customRowCellLinker(scope, function (clone) {
                                    return clone;
                                }));
                            }
                            else { // Add the normal cell html
                                if (!normalRowCellLinker) {
                                    // Do the final compile
                                    normalRowCellLinker = $compile(angular.element(cellHtml));
                                }

                                element.append(normalRowCellLinker(scope, function (clone) {
                                    return clone;
                                }));
                            }
                        }

                        scope.isSelected = function () {
                            return scope.api.selection && scope.api.selection.isRowSelected(scope.row);
                        };
                    }
                }
            }
        };
    }])
    .directive('crmGridRowFixed', ['$compile', '$templateCache', function ($compile, $templateCache) {

        var cellHtml = $templateCache.get('crm.grid.fixed.cell');
        return {
            compile: function () {
                var linkerFn;
                var linkerCustomFn;
                return {
                    post: function (scope, element, attrs, controllers) {

                        var blockOptions = scope.options.blockOptions[scope.row.getBlockOptionsName() || 'rows'];
                        
                        var rowCellTemplate = blockOptions.rowCellTemplate || scope.options.rowCellTemplate;
                        if (rowCellTemplate) { // Add the template
                            if (!linkerCustomFn) {
                                // Turn the template into an element
                                var rowTemplateEl = angular.element(rowCellTemplate);

                                // Add the cell html to the new row element
                                rowTemplateEl.html(cellHtml);

                                // Do the final compile
                                linkerCustomFn = $compile(rowTemplateEl);
                            }

                            element.append(linkerCustomFn(scope, function (clone) {
                                return clone;
                            }));
                        }
                        else { // Add the normal cell html
                            if (!linkerFn) {
                                // Do the final compile
                                linkerFn = $compile(angular.element(cellHtml));
                            }

                            element.append(linkerFn(scope, function (clone) {
                                return clone;
                            }));
                        }

                        scope.isSelected = function () {
                            return scope.api.selection && scope.api.selection.isRowSelected(scope.row);
                        };
                    }
                }
            }
        };
    }])
    .directive('crmGridColHeaderFixed', ['$compile', function ($compile) {

        var resizableHtml = '<div class="resize-handle"></div>'

        return {
            link: function (scope, element, attrs) {
                createColHeaderDirective(scope, element, attrs, $compile);
            },
            template: defaultColHeaderHtml
        };
    }])
    .directive('crmGridColHeader', ['$compile', function ($compile) {

        var resizableHtml = '<div class="resize-handle"></div>';

        return {
            link: function(scope, element, attrs){
                createColHeaderDirective(scope, element, attrs, $compile, resizableHtml);
            },
            template: defaultColHeaderHtml + resizableHtml
        };
    }])
    .directive('crmGridCell', ['$compile', '$filter', function ($compile, $filter) {
        var defaultTemplate = '<span>{{getCellData()}}</span>';
        return {
            priority: 2,
            link: function (scope, element, attrs, controller, transcludeFn) {
                
                var templateFuncs = {};
                scope.$watch('col.data.template', function () {
                    // Save the default cell configuration
                    var defaultLinkerFn;

                    var template = scope.col.data.template;

                    // Saves all of the possible cell templates
                    var linkerMap = {};

                    var linkerFunc;
                    if (template) {

                        // Compile the contents to a new template linking function
                        if (!linkerMap[scope.col.data.hash]) {
                            linkerMap[scope.col.data.hash] = $compile(angular.element(scope.col.data.template));
                        }

                        linkerFunc = linkerMap[scope.col.data.hash];
                    }
                    else {
                        // Create the default template function if it does not exist
                        if (!defaultLinkerFn) {
                            defaultLinkerFn = $compile(angular.element(defaultTemplate));
                        }

                        linkerFunc = defaultLinkerFn;
                    }

                    // Call the saved linker function and append the cloned element to the parent element
                    element.empty();
                    element.append(linkerFunc(scope, function (clone) {
                        return clone;
                    }));
                });

            },
            controller: function ($scope) {
                $scope.getCellData = function () {

                    var val;

                    // This is a user defined cell formatting function that will be called for each cell
                    if ($scope.options.cellFormatter) {
                        val = $scope.options.cellFormatter($scope.row, $scope.col);
                    }
                    else { // If a formatter does not exist do the default logic
                        val = $scope.row.data[$scope.col.data.value];
                        if (val === undefined) {
                            val = '';
                        }
                        else if (val instanceof Date) {
                            val = $filter('date')(val, 'MM/dd/yy');
                        }
                    }

                    return val;
                };
            }
        };
    }])
        // TODO: Implement drag and drop column functionality
    .directive('crmGridColumnMove', [function () {
        return {
            priority: 3,
            link: function (scope, element, attrs) {

            }
        };
    }]);

    // ------------------- Utility Functions ----------------------------- //
    function getBlockContainerData(key) {
        var result;
        if (this._conData) {
            result = this._conData.getContainerData(key);
        }
        else {
            key = (key || '').toLocaleLowerCase();
            var result;
            switch (key) {
                case 'pos':
                    result = this.getAbsolutePos();
                    break;
                case 'end':
                    result = this.getAbsoluteEnd();
                    break;
            }
        }

        return result;
    }

    function getIndexAndManager(block){
        var index = -1;

        // Get the block's parent. This gives access to the list that the block belongs to
        var parent;
        if(block){
            parent = block.getParent();
            if(parent){ // If there is a parent search for the block inside of the parent
                // Get the index of the block
                var index = getBlockIndexByScrollPosition(parent, 'getChildrenCount', 'getChildByIndex', block.getAbsolutePos());
            }
        }

        var blockManager;
        /*if(parent){
            // Return a wrapper block manager object to prevent the outside from accessing the block main block manager
            blockManager = {
                getChildByIndex: function(index){
                    return parent.getChildByIndex(index);
                },
                getChildrenCount: function(){
                    return parent.getChildrenCount();
                }
            };
        }*/

        return {
            index: index,
            manager: parent
        };
    }
    
    function getPrevSiblingIndexAndManager(block){
        var indexAndList = getIndexAndManager(block);
        if(indexAndList.index > 0){
            indexAndList.index -= 1;
        }
        return indexAndList;
    }
    
    function getSiblingIndexAndManager(block){
        var indexAndList = getIndexAndManager(block);
        if(indexAndList.index > -1){
            indexAndList.index += 1;
        }
        return indexAndList;
    }

    function getNewContainerData(pos){
        return {
            maxsize: undefined,
            minsize: undefined,
            hasdiffsize: false,
            pos: pos || 0,
            totalsize: 0
        };
    }

    // This updates the size of the passed in container data based on a passed in block
    function resyncBlockPositions(containerData, block, noChildren){
        if(block.getParent() && (!block.getParent().hasVisibleChildren() || noChildren)){
            var offScreen = -1;
            block.setPos(offScreen);
            //block.setSize(offScreen);
        }
        else{
            // Set the minimum and maximum container size if it is not set yet
            if(containerData.minsize === undefined || containerData.maxsize === undefined){
                containerData.minsize = block.getSize() || 0;
                containerData.maxsize = block.getSize() || 0;
                containerData.prevsize = block.getSize();
            }
            else{
                // Update the minimum size if the block is less than the current minimum size
                if(block.getSize() < containerData.minsize){
                    containerData.minsize = block.getSize();
                }

                // Update the maximum size if the block is greater than the current maximum size
                if(block.getSize() > containerData.maxsize){
                    containerData.maxsize = block.getSize();
                }
            }

            // Flag the blocks as being different sizes
            if(containerData.prevsize != block.getSize()){
                containerData.hasdiffsize = true;
            }

            // The block should be positioned at the current base of the container
            block.setPos(containerData.totalsize);

            // For each block save the previous size and increase the size of the container
            containerData.prevsize = block.getSize();
            containerData.totalsize += block.getSize();
        }
    }

    function updateBlockSelection(block) {
        var parent = block.getParent();
        var manager;
        if (parent && parent.getSelectionManager()) {
            manager = parent.getSelectionManager();
            manager.updateSelectedRow(block);
        }
    }

    // Adds container details to a block
    function addContainerData(block, newConData){
        var privateConData = copyPrivateConData(newConData);
        block._conData = {};
        block._conData.getContainerData = function(key){
            var result;

            if(key){
                if(key == 'end'){
                    result = getContainerDataEnd.call(privateConData);
                }
                else{
                    result = privateConData[key.toLocaleLowerCase()];
                }
            }

            return result;
        }
    }

    /*function resetRowContainerData() {
        this.getContainerData = function (key) {
            key = (key || '').toLocaleLowerCase();
            var result;
            switch (key) {
                case 'pos':
                    result = this.getAbsolutePos();
                    break;
                case 'end':
                    result = this.getAbsoluteEnd();
                    break;
            }
        };
    }

    function resetRowContainerData(row){
        var con = getNewContainerData(row.getAbsolutePos());
        con.totalsize = row.getSize();
        addContainerData(row, con)
    }*/

    // A utiltiy method for getting the container data's end. This is a reference so that all containerData objects can use the same method
    function getContainerDataEnd(){
        return this.pos + this.totalsize;
    }

    // Determines if the block is visible
    function isBlockVisible(block){
        var isVisible = true;

        var iterBlock = block;
        while(isVisible && iterBlock && iterBlock.getParent()){
            isVisible = iterBlock.getParent().hasVisibleChildren();
            iterBlock = iterBlock.getParent();
        }

        return isVisible;
    }

    // Utility function for getting a block or list of blocks that are a specified number away from the target block
    function getBlockByBlocksFromBackward(block, count, findAll, includeFrom){
        // Keeps a running count of how many passes have happend
        var runningCount = 0;
        count = Math.abs(count);
        var listManager; // The current list manager

        var blockIter = block;
        var index; // Tracks the index that should be pulled

        var foundBlocks = []; // The list of found blocks

        var addFound;

        // If the user wants all of the found blocks, make addFound add a block to a list
        if(findAll){
            addFound = function(block){
                if(block && isBlockVisible(block) && runningCount < count){
                    foundBlocks[foundBlocks.length] = block;
                    runningCount++;
                }
            };
        }
        else{ // Otherwise just update a single block
            addFound = function(block){
                if(block && isBlockVisible(block) && runningCount < count){
                    foundBlocks = [block];
                    runningCount++;
                }
            };
        }

        // Include the first block if the flag is set
        if(includeFrom){
            addFound(block);
        }

        // Get the list and index of the block relative to the list
        var indexAndList = getIndexAndManager(block);
        listManager = indexAndList.manager;
        index = indexAndList.index;

        // Iterate to the next block
        index--;

        while(runningCount < count && listManager){

            // If the list is exhausted jump to the next list
            if(index < 0){
                listManager = undefined;
                // Find the position of the list manager block
                indexAndList = getIndexAndManager(blockIter.getParent());
                if(indexAndList){

                    while(indexAndList && indexAndList.index == -1 && indexAndList.manager){
                        indexAndList = getIndexAndManager(indexAndList.manager);
                    }

                    indexAndList = indexAndList || {index: -1};
                    listManager = indexAndList.manager;
                    index = indexAndList.index;

                    if(listManager){
                        index = indexAndList.index;
                        blockIter = listManager.getChildByIndex(index);
                        addFound(blockIter);
                        index--;
                    }
                }
                else{
                    listManager = undefined;
                }
            }

            if(listManager && index > -1){
                // Get the next block
                blockIter = listManager.getChildByIndex(index);

                // If the current block has children, update the list and move to the last child of that list
                if(blockIter.getChildrenCount() > 0){
                    // The current pointer is the new list
                    listManager = blockIter;

                    // The current pointer should point to the last block in the new list
                    index = listManager.getChildrenCount() - 1;
                }
                else{
                    addFound(blockIter);
                    index--;
                }
            }
        }

        // The current block should be defined as long as there are blocks and the count is not greater than the number of blocks
        return foundBlocks;
    }

    // Utility function for getting a block or list of blocks that are a specified number away from the target block
    function getBlockByBlocksFromForward(block, count, findAll, includeFrom){
        // Keeps a running count of how many passes have happend
        var runningCount = 0;

        var siblingsStack = []; // Tracks the parent's nearest. This allows for returning to childs nearest parent siblings.
        var listManager; // The current list manager

        var blockIter;
        var index = 0; // Tracks the index that should be pulled

        var sibling; // Tracks the current sibling

        var foundBlocks = []; // The list of found blocks

        var addFound;

        if(isBlockVisible(block)){
            // If the user wants all of the found blocks, make addFound add a block to a list
            if(findAll){
                addFound = function(block){
                    if(block && isBlockVisible(block) && runningCount < count){
                        foundBlocks[foundBlocks.length] = block;
                        runningCount++;
                    }
                };
            }
            else{ // Otherwise just update a single block
                addFound = function(block){
                    if(block  && isBlockVisible(block) && runningCount < count){
                        foundBlocks = [block];
                        runningCount++;
                    }
                };
            }

            // Include the first block if the flag is set
            if(includeFrom){
                addFound(block);
            }

            // If children blocks are present, the new parent should be the first child
            if(block.getChildrenCount() > 0 && block.hasVisibleChildren()){
                listManager = block; // The passed in block is the current list manager

                // Get the next block after the passed in block and save it
                blockIter = block.getChildByIndex(0);
                addFound(blockIter);

                // Save the nearest parent for processing later
                var sibling = getSiblingIndexAndManager(blockIter.getParent());
                if(sibling.index > -1){
                    siblingsStack[siblingsStack.length] = sibling;
                }

                // The index should be ready for the next block that is next to it
                index = 1;
            }
            else if(block.getParent() && isBlockVisible(block.getParent())){ // Otherwise go to the nearest sibling
                listManager = block.getParent(); // Get the list manager of the passed in block

                // Get the index of the next block in the list manager
                var sibling = getSiblingIndexAndManager(block);
                
                // Get ready for the next block
                index = sibling.index;

                // Save the nearest parent for processing later
                var nextForStack = getSiblingIndexAndManager(listManager);
                if(nextForStack.manager){
                    siblingsStack[siblingsStack.length] = nextForStack;
                }

                // If the index is invalid then get the next list manager from the sibling stack
                if(index < 0 || index >= listManager.getChildrenCount()){
                    var tempManIn = siblingsStack.pop();
                    listManager = undefined;
                    if(tempManIn){
                        listManager = tempManIn.manager;
                        index = tempManIn.index;
                    }
                }
            }

            // Make sure the list manager is not exhausted before entering the loop
            if (listManager && index >= listManager.getChildrenCount() && siblingsStack.length > 0) {
                var temp = siblingsStack.pop();
                listManager = temp.manager;
                index = temp.index;
            }

            // Loop through all of the blocks in the current block manager
            while(runningCount < count && listManager && index < listManager.getChildrenCount()){
                blockIter = listManager.getChildByIndex(index);
                addFound(blockIter);

                // Go to the next level if the current iter block has children
                if(blockIter.getChildrenCount() > 0 && blockIter.hasVisibleChildren()){
                    // Track the next parent before drilling into the current parent
                    siblingsStack[siblingsStack.length] = getSiblingIndexAndManager(blockIter);

                    // Jump to the next level
                    listManager = blockIter; // The list that manages the next level
                    blockIter = listManager.getChildByIndex(0); // The current position of the iteration pointer
                    addFound(blockIter);
                    index = 0; // Update the index as stating that the first block in the new list has been processed
                    
                }

                index++;

                // If the index is greater than or equal to the number of children, look for the next list manager
                if(index >= listManager.getChildrenCount()){
                    // Step backwards to a previous level to process the blocks that were skipped
                    var stepBackParent = siblingsStack.pop();
                    if(stepBackParent){
                        listManager = stepBackParent.manager; // The next manager that manages the level that is a step back
                        blockIter = listManager.getChildByIndex(stepBackParent.index); // The first block in the step back level
                        index = stepBackParent.index;
                    }
                    else if(blockIter && blockIter.getParent()){
                        var managerAndIndex = getSiblingIndexAndManager(blockIter.getParent());
                        if(managerAndIndex && managerAndIndex.manager && managerAndIndex.index > -1 && managerAndIndex.index < managerAndIndex.manager.getChildrenCount()){
                            index = managerAndIndex.index;
                            listManager = managerAndIndex.manager;
                        }
                    }
                    else{
                        listManager = undefined;
                    }
                }
            }
        }

        // The current block should be defined as long as there are blocks and the count is not greater than the number of blocks
        return foundBlocks;
    }
    
    function getBlockByBlocksFrom(block, count, findAll, includeFrom){
        var result;
        if(count > 0){
            result = getBlockByBlocksFromForward(block, count, findAll, includeFrom);
        }
        else if(count < 0){
            result = getBlockByBlocksFromBackward(block, count, findAll, includeFrom);
        }

        return result;
    }

    // Moves the scroller to the desired col or row based on the index
    function scrollByIndexViewWindow(index, renderData, rowScroll) {
        var viewWindow = this;
        scrollByIndex(index, renderData, viewWindow.$viewPort, viewWindow.$content, rowScroll);
    }

    function findBlockByAbsoluteIndex(index, baseManager){
        var managerCount = baseManager.getChildrenCount();
        var last = managerCount - 1;
        // Use a modified binary search and always save the index that is less than the passed in index
        var lastBlock = baseManager.getChildByIndex(last);
        var nextManagerIndex = -1;
        if(lastBlock){

            // Get the next possible manager
            var absoluteManagerCount = lastBlock.getAbsoluteIndex() + 1;
            var nextManagerIndex = managerCount - (absoluteManagerCount - managerCount);

            // Tracks the largest index that is smaller than the passed in index
            var lessThanIndex = -1;
            var first = 0;
            var middle = Math.floor((first + last) / 2);
            var curBlock;
            var foundBlock;

            while(first <= last && !foundBlock){
                curBlock = baseManager.getChildByIndex(middle);
                if(index > curBlock.getAbsoluteIndex()){
                    first = middle + 1;
                }
                else if(index < curBlock.getAbsoluteIndex()){
                   last = middle - 1; 
                }
                else{
                    foundBlock = baseManager.getChildByIndex(middle);
                }

                middle = Math.floor((first + last) / 2);
            }
        }

        // If the block is not found, find the next possible manager
        if(!foundBlock && nextManagerIndex > 0){
            var newManager = baseManager.getChildByIndex(nextManagerIndex);
            if(newManager && newManager.getChildrenCount() > 0){
                foundBlock = findBlockByAbsoluteIndex(newManager.getAbsoluteIndex(), newManager);
            }
        }

        return foundBlock;
    }

    function scrollToBlock(scrollBlock, $viewPort, $content, rowScroll) {

        // If the rowScroll flag is set use row scrolling logic or wise use column scrolling logic
        if (rowScroll) {
            // Scroll to the top or bottom depending on the position of the row
            var rowTop = scrollBlock.getAbsolutePos();
            var rowBottom = scrollBlock.getAbsoluteEnd();
            var viewTop = getViewTop($viewPort, $content);
            var viewBottom = getViewBottom($viewPort, $content);

            // If the top of the row is higher than the view window's top, scroll to the top of the row
            if (rowTop < viewTop) {
                $viewPort.scrollTop(rowTop);
            }
            else if (rowBottom > viewBottom) { // If the bottom of the row is lower than the view window's bottom, add the difference of the row bottom and view bottom to get in the right position
                var scrollTop = $viewPort.scrollTop();
                $viewPort.scrollTop(scrollTop + (rowBottom - viewBottom));
            }
        }
        else {
            // Scroll to the left or right depending on the position of the column
            var colLeft = scrollBlock.getAbsolutePos();
            var colRight = scrollBlock.getAbsoluteEnd();
            var viewLeft = getViewLeft($viewPort, $content);
            var viewRight = getViewRight($viewPort, $content);

            // The following logic is the same as the row logic, except for it deals with horizontal scrolling
            if (colLeft < viewLeft) {
                $viewPort.scrollLeft(colLeft);
            }
            else if (colRight > viewRight) {
                var scrollLeft = $viewPort.scrollLeft();
                $viewPort.scrollLeft(scrollLeft + (colRight - viewRight));
            }
        }

    }

    // Normalizes the the scrolling content container so that rows can be accurately compared to the viewport boundary.
    // This is neccessary because the scrolling content moves outside of the viewport.
    function getViewTop($viewPort, $content) {

        // The view top is the difference between the static view window and the scrolling content
        var viewTop = $viewPort.offset().top - $content.offset().top;

        return viewTop;
    }

    // Normalizes the the scrolling content container so that rows can be accurately compared to the viewport boundary.
    // This is neccessary because the scrolling content moves outside of the viewport.
    function getViewBottom($viewPort, $content) {
        return getViewTop($viewPort, $content) + $viewPort.outerHeight();
    }

    // Normalizes the the scrolling content container so that columns can be accurately compared to the viewport boundary.
    // This is neccessary because the scrolling content moves outside of the viewport.
    function getViewRight($viewPort) {
        return getViewLeft() + $viewPort.outerWidth();
    }

    // Normalizes the the scrolling content container so that columns can be accurately compared to the viewport boundary.
    // This is neccessary because the scrolling content moves outside of the viewport.
    function getViewLeft($viewPort, $content) {

        // The view left is the difference between the static view window and the scrolling content
        var viewLeft = $viewPort.offset().left - $content.offset().left;

        return viewLeft;
    }

    // The main update method when a scroll occurs - This is a utiltity method. This should be called inside of a view window
    function updateRenderData(viewWindow, renderState, forceRefresh) {

        var isUpdated = false;

        // Size the view window based on the block managers content before perfoming any calculations
        viewWindow.resizeWindowToManager();
        
        // Get the minimum number of blocks to fill up the viewer
        if (viewWindow.getMinBlockSize() !== undefined) {
            var minBlocks = getMinBlocks(viewWindow.getMinBlockSize(), viewWindow.getViewPortSize(), viewWindow.hasBlocks());

            // Calculate what the first row in the view port should be.
            var newStart = viewWindow.getBlockByCurrentScrollPosition();

            // Get the end row based on the first row.
            var newEnd = viewWindow.getBlockByBlocksFrom(newStart, minBlocks)[0];

            // Checks wheter the new start position is not equal to the old start position
            var isNotEqual = !newStart || !renderState.start || (newStart.getAbsolutePos() !== renderState.start.getAbsolutePos());

            // Check whether the new start position has passed the breaking point
            var isStartPastBreak = !renderState.startBreakAt || !newStart || newStart.getAbsolutePos() < renderState.startBreakAt.getAbsolutePos();

            // Check whether the new end position has passed the breaking point
            var isEndPastBreak = !renderState.endBreakAt || !newEnd || newEnd.getAbsolutePos() > renderState.endBreakAt.getAbsolutePos();

            // Update the current row top row and bottom row only if a new start position occurs and the breakpoints have been triggered
            if (forceRefresh || isNotEqual && (isStartPastBreak || isEndPastBreak)) {
                viewWindow.updateHeaders();

                // Get the number of rows to render by adding the minimum number of rows and the buffer rows
                var renderedBlocksLength = minBlocks + renderState.buffStart + renderState.buffEnd;

                // Update the new start and end rows
                renderState.start = newStart;
                renderState.end = newEnd;

                // Set the break points
                var startMidCount = Math.floor(renderState.buffStart / 2);
                var endMidCount = Math.floor(renderState.buffEnd / 2);
                var ending = [];
                if (newEnd) {
                    ending = viewWindow.getBlockByBlocksFrom(newEnd, endMidCount, true);
                }
                var starting = viewWindow.getBlockByBlocksFrom(newStart, -startMidCount, true);
                renderState.endBreakAt = ending[ending.length - 1] || newEnd;
                renderState.startBreakAt = starting[starting.length - 1] || newStart;

                // Get the final starting block of the blocks to render. This is based on the amount of buffer blocks
                var finalStartBlock = renderState.start;

                var finalSet = viewWindow.getBlockByBlocksFrom(finalStartBlock, -renderState.buffStart);

                // Modify the starting block based on the number of buffer blocks
                finalStartBlock = finalSet[finalSet.length - 1] || renderState.start;

                // Get the renderedRows and update the scopes start index
                viewWindow.renderedData = viewWindow.getBlockByBlocksFrom(finalStartBlock, renderedBlocksLength, true, true);

                // true - An update occurred
                isUpdated = true;
            }
        }

        return isUpdated;
    }

    // Sort html
    function getSortImage(src, offset, ngShow) {
        return '<img data-ng-if="' + ngShow + '" src="' + src + '" style="position:absolute;left:' + offset + 'px;"/>';
    }

    var headerLabelHtml = '<span data-ng-if="!col.data.label">&nbsp;</span>' +
        '<label data-ng-if="col.data.label !== undefined && col.data.label != \'\'">{{col.data.label}}</label>';

    // 64 bit encoding for the grid's sort icons
    var sortBothBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAAXNSR0IArs4c6QAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+ACDAQdO6PocB4AAADHSURBVDjLrZQxCoUwEER3JGBj5wUs0wje/wqiCDZ2yQXsbATN/O6jYjRGF1JsWGbfspOApHwVSUgRAzsmIUJN04hzjq/FrLUiItK27TuyZVk4juM/n+eZ0WJd1+3yvu/jyHwU0zTxsZiPYhgG73aTp923SzkGvjStOrs0xuy2eAyttWRZhqAxi6K4JDgT8ooBgNb6VKgsy+fW8HVP0xRRpj1SVFUV/5y2FHmei1IKd7/C5VnXlXVd0znHu9ogn5EkANzVfWraHxMuj5hftBuoAAAAAElFTkSuQmCC';
    var sortDescBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+ACDA8EKccER68AAACfSURBVDjLY/z//z8DtQATAxXBqGGjhtHDMBZsgqfOMvyXWamFQwsjw8eUqwyaagyMRLnM2ICBgZERh1GM/7EahNMwZmYGxg/J17Aaxlx6jfQw01RjYER3HSMjA4OYCAMjWRGA7greumvkx6aYCAPjNa+rDAwMDAxPwq8x8HDjdhVRScPGgpGBkRESKYQAIzGF458/DP9ZWPC7imjDiAUAPq8fon2YZQ0AAAAASUVORK5CYII=';
    var sortAscBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+ACDA8GFkNUCBAAAACVSURBVDjLY/z//z8DtQATMYr+/GH4TxXD/v5l+L9y/X+GHz8IG0jQsLMXGBicTmswHDnxnzKXffnK8F92pToDAwMDg/Y2DYZXb/C7Dq9hJ06j6t138D95Lnv1huG/9jYNFDH7kxoM12/hdh1Ow/51qWMVF5yjzvD3L3YDsRp2/RYDztT3Hxop2AAj3RPtqGGjhg0mwwAdSzb6KsXOlwAAAABJRU5ErkJggg==';
    var base64Image = 'data:image/png;base64'

    var sortOffSets = 4;
    var sortConStyle = 'right: ' + sortOffSets + 'px;top: 5px;width: 12px;height: 16px;position: absolute;'; // The styling for the sort images container
    var sortClickStyle = 'cursor:pointer;position:absolute;width: 100%;height: 100%;top: 0px;left: -3px;z-index:1;'; // The styling for sort header click zone
    var sortAction = 'doSingleSort(col.data.value)'; // The header click action
    var ngShowNoSort = "getSortByField(col.data.value).dir == ''"; // The show expression for the no sort image
    var ngShowSortAsc = "getSortDirByField(col.data.value) == 'asc'"; // The show expression for the ascending sort image
    var ngShowSortDesc = "getSortDirByField(col.data.value) == 'desc'"; // The show expression for the descending sort image
    var sortHeaderTemplate = [
    '<div class="single-line-text" data-ng-if="isSortEnabled() && isColumnSortEnabled(col)">',
        '<div data-ng-click="' + sortAction + '" style="' + sortClickStyle + '"></div>',
        headerLabelHtml,
        '<div style="' + sortConStyle + '">' +
        getSortImage(base64Image + ',' + sortBothBase64, 0, ngShowNoSort) +
        getSortImage(base64Image + ',' + sortDescBase64, 0, ngShowSortDesc) +
        getSortImage(base64Image + ',' + sortAscBase64, 0, ngShowSortAsc) + '</div>',
    '</div>'
    ].join('');

    var defaultColHeaderHtml = [
        '<div class="single-line-text" data-ng-if="!isSortEnabled() || !isColumnSortEnabled(col)">',
            headerLabelHtml,
        '</div>',
        sortHeaderTemplate
    ].join('');

    // Setups basic logic for the col header directives
    function createColHeaderDirective(scope, element, attrs, $compile, resizeHtml) {
        var templateFuncs = {};
        scope.$watch('col.data.value', function () {

            var template = scope.col.data.headerTemplate || defaultColHeaderHtml;

            // Saves all of the possible header templates
            var linkerMap = {};

            var linkerFunc;

            // If the header has a template then compile it
            if (template) {

                // Added the resize handle html to the users template
                if (resizeHtml) {
                    template += resizeHtml;
                }

                // Compile the contents to a new template linking function
                if (!linkerMap[scope.col.data.value]) {
                    linkerMap[scope.col.data.value] = $compile(angular.element(template));
                }

                // Get the appropriate linking function
                linkerFunc = linkerMap[scope.col.data.value];

                // Call the saved linker function and append the cloned element to the parent element
                element.empty();
                element.append(linkerFunc(scope, function (clone) {
                    return clone;
                }));
            }
        });
    }

    // Gets the minimum blocks based on the height of the size of the view
    function getMinBlocks(minSize, viewSize, hasBlocks) {
        var minBlocks = Math.ceil(viewSize / minSize);

        // If the  minRows is equal to 0 then it is because the view is too small.
        // At least one row should if there are any blocks to render
        if (minBlocks == 0 && hasBlocks) {
            minBlocks = 1;
        }

        return minBlocks;
    }

    // Makes a new copy of the container data
    function copyPrivateConData(d){
        d = d || {};
        return{
            totalsize: d.totalsize,
            hasdiffsize: d.hasdiffsize,
            maxsize: d.maxsize,
            minsize: d.minsize,
            //data: d.data,
            pos: d.pos || 0,
            totalsize: d.totalsize || 0
        };
    }

    // A Utility method for defaulting. Both source and def should have the passed in path.
    function returnSourceOrDefault(source, def, path, delimiter){
        var result;
        delimiter = delimiter || '.';

        if(!path){
            result = source || def;
        }
        else{
            // Split the path up
            var tokens = path.split(delimiter);
            var iterSource = source;
            var iterDef = def;

            var curToken;
            for(var i = 0; i < tokens.length; i++){
                curToken = tokens[i];
                if(curToken){
                    iterSource = iterSource[curToken];
                    iterDef = iterDef[curToken];
                }
            }
        }

        return iterSource || iterDef;
    }

    // A utility method for finding an index of a block based on its position. This requires a block manager or a row that contains nested rows.
    // This uses a modified binary search. Use this if the blocks that are being searched are different sizes.
    function getBlockIndexByScrollPositionBinary(manager, countMethodName, indexMethodName, scrollPos) {
        // Run a binary search on the collection of data to get the approriate starting index

        // The indexing variables used for tracking the current compare group
        var intersectionIndex = -1,
            start = 0,
            last = manager[countMethodName]() - 1,
            middle = Math.floor(last / 2);

        var block = manager[indexMethodName](middle);
        var intersectionFound = false;

        if(manager.hasVisibleChildren()){
            // Keep looping until the rows are exhausted or an exact match is found
            while (start <= last && !intersectionFound) {

                // If the scroller is less than the current block's bounding box, it is still possible for the scroller to be equal to the block
                if (scrollPos < block.getContainerData('end')) {

                    // If the scroller is inside of the blocks bounding box, return the index and break out of the loop
                    if(scrollPos >= block.getAbsolutePos()){
                        intersectionFound = true;
                        intersectionIndex = middle;
                    }

                    // Shrink the last index until you find the smallest one
                    last = middle - 1;

                } // If the scroller is greater than the current block's bounding box, the scroller is already past the current block
                else if (scrollPos > block.getContainerData('end')) {
                    start = middle + 1;
                }
                else { // Just in case the scroller is at the exactly on the bottom of the row
                    intersectionFound = true;
                    intersectionIndex = middle;
                    if(intersectionIndex < manager[countMethodName]() - 1){
                        intersectionIndex += 1;
                    }
                }

                // Update the middle to keep doing calculations
                middle = Math.floor((start + last) / 2);
                block = manager[indexMethodName](middle);
            }
        }

        // Return the found index
        return intersectionIndex;
    }

    // A utility method for finding an index of a block based on its position. This requires a block manager or a row that contains nested rows.
    // This determines the position of a block based on the size of the block and the scroll position. Use this if the blocks are equal in size
    function getBlockIndexByScrollPositionDivide(manager, countMethodName, indexMethodName, scrollPos){
        var firstBlock = manager[indexMethodName](0);
        var blockIndex = -1;

        // Perform the search only if there are blocks to calculate
        if(firstBlock){
            var blockSize = firstBlock.getSize();

            // Get the index of the block by dividing the scroll position by the block size
            blockIndex = Math.floor(scrollPos / blockSize);
        }

        return blockIndex;
    }

    // A utility method for finding an index of a block based on its position. This requires a block manager or a row that contains nested rows.
    // This is a smart get index function. It will calculate the index using the binary search or division depending on which one works best.
    function getBlockIndexByScrollPosition(manager, countMethodName, indexMethodName, scrollPos){
        var index = -1;
        if(manager.getContainerData('hasDiffSize')){
            index = getBlockIndexByScrollPositionBinary(manager, countMethodName, indexMethodName, scrollPos);
        }
        else{
            index = getBlockIndexByScrollPositionBinary(manager, countMethodName, indexMethodName, scrollPos);
            //index = getBlockIndexByScrollPositionDivide(manager, countMethodName, indexMethodName, scrollPos);
        }

        return index;
    }

    // Will recursively search through the base block manager based on the scroll position
    function getNestedBlockIndexByScrollPosition(baseManager, countMethodName, indexMethodName, scrollPos){
        var index = -1;
        var isFound = false; // Determines if the block has been found
        if (baseManager && baseManager[countMethodName]() > 0) {
            // Search the list for an index
            index = getBlockIndexByScrollPosition(baseManager, countMethodName, indexMethodName, scrollPos);

            // If the index is not found, make the last block in the manager the new manager to check for any trailing children
            if (index == -1) {
                var lastIndex = baseManager[countMethodName]() - 1;
                var last = baseManager[indexMethodName](lastIndex);

                // If there are children in the last block, there are definitely trailing children. Set the manager to the last block
                if (last[countMethodName]() > 0) {
                    baseManager = last;
                }
                else { // Otherwise set the next manager as not existing
                    baseManager = undefined;
                }
            }
            else { // The block is found, but requires extra validation.
                var foundBlock = baseManager[indexMethodName](index);
                // Validation is required whenever a block contains other blocks
                if (foundBlock.hasVisibleChildren() && foundBlock.getChildrenCount() > 0) {
                    // If the block is a container for other blocks, check to make sure the scroll position is not greater than or equal to the block's bounding box.
                    if (scrollPos >= foundBlock.getAbsoluteEnd()) {
                        index = -1;
                        baseManager = foundBlock;
                    }
                }
                // If the scroll position does not intersect the found block, check to see if the previous block has children that contain the proper block
                /*if(scrollPos < foundBlock.getAbsolutePos() || scrollPos > foundBlock.getAbsoluteEnd()){

                    // If the scroller is behind the found block, go to the previous block to check the children
                    if(scrollPos < foundBlock.getAbsolutePos()){
                        if((index - 1) < 0){ // There is not a previous block to check
                            baseManager = undefined;
                            index = -1;
                        }
                        else{ // There is a previous block. Check to see if it has children
                            var prevBlock = baseManager[indexMethodName](index);
                            if(prevBlock[countMethodName]() == 0){
                                baseManager = undefined;
                                index = -1;
                            }
                            else{
                                baseManager = prevBlock;
                            }
                        }
                    }
                }*/
            }
        }
        else {
            baseManager = undefined;
        }
        
        // ------ Base Cases
        if(index == -1 && !baseManager){ // The search has ended with no matches.
            return; // return nothing
        }
        else if(index > -1){ // The search has found the block
            return {
                manager: baseManager,
                index: index
            };
        }

        // The tail end recursive call - The return value is the return value of the previous call 
        return getNestedBlockIndexByScrollPosition(baseManager, countMethodName, indexMethodName, scrollPos);

    }

    // The quick array row hash/key compare function
    function quickArrayMapComp (item) {
        var result;
        if (typeof item == 'object') {
            result = item.getHash();
        }
        else {
            result = item;
        }
        return result;
    }

    // Does the basic sort direction logic
    //  1: dataA is on the top (asc)
    // -1: dataA is on the bottom (asc)
    //  0: dataA is equal (asc)
    // -1: dataA is on the top (desc)
    //  1: dataA is on the bottom (desc)
    //  0: dataA is equal (desc)
    function getSortValue(dataA, dataB, direction) {
        var sortValue = 0;
        var dir = direction || 'asc';

        if (dir.toLowerCase() == 'asc') {
            if (dataA > dataB) {
                sortValue = 1;
            }
            else if (dataA < dataB) {
                sortValue = -1;
            }
        }
        else {
            if (dataA > dataB) {
                sortValue = -1;
            }
            else if (dataA < dataB) {
                sortValue = 1;
            }
        }
        return sortValue;
    }

    // Allows for multi sort
    function getMultiSortValue (rowA, rowB, sort, getValue) {

        // The basic sort variable declarations
        var sortValue = 0;
        var dataA;
        var dataB;
        var fieldName;
        var curSort;
        var fieldDir;

        // Do the basic field sort logic for the multiple rows
        // Keep looping until the array is exhausted or the sortValue is no longer equal
        var fieldIter = 0;
        while (sortValue == 0 && fieldIter < sort.length) {
            curSort = sort[fieldIter];

            // Get the compare value from each row
            fieldName = curSort.by;

            // Base the data on the value formatter if it is available otherwise use the normal value
            if (getValue) {
                dataA = getValue(fieldName, rowA[fieldName]);
                dataB = getValue(fieldName, rowB[fieldName]);
            }
            else {
                dataA = rowA[fieldName];
                dataB = rowB[fieldName];
            }

            // Get the sort value based on the comparison
            fieldDir = curSort.dir || '';
            fieldDir = fieldDir.toLocaleLowerCase();
            sortValue = getSortValue(dataA, dataB, fieldDir);

            // Iterate to the next field
            fieldIter++;
        }

        return sortValue;
    }

    // --------------- Jquery PollyFills ------------------------ //
    // Implement the outerHeight if it is not available
    if(!angular.element.prototype.outerHeight){
        angular.element.prototype.outerHeight = function(val){
            var el = this[0]; // Get the dom object from JQLite
            var result = this;

            if(this.length > 0){
                if(val === undefined){ // Return the current size if the user does not pass in a new size
                    result = el.offsetHeight;
                }
                else{ // Otherwise set the new size and return the invoking object
                    result = this;
                    if(val || val === 0){
                        // if the value is a number default it to pixels
                        if(!isNaN(val)){
                            val = val + 'px';
                        }
                        el.style.height = val;
                    }
                }
            }
            return result;
        };
    }

    // Implement the outerWidth if it is not available
    if(!angular.element.prototype.outerWidth){

        angular.element.prototype.outerWidth = function(val){
            var el = this[0]; // Get the dom object from JQLite
            var result = this;
            
            if(this.length > 0){
                if(val === undefined){ // Return the current size if the user does not pass in a new size
                    result = el.offsetWidth;
                }
                else{ // Otherwise set the new size and return the invoking object
                    result = this;
                    if(val || val === 0){
                        // if the value is a number default it to pixels
                        if(!isNaN(val)){
                            val = val + 'px';
                        }
                        el.style.width = val;
                    }
                }    
            }
            
            return result;
        };
    }

    // Implement the scrollTop if it is not available
    if(!angular.element.prototype.scrollTop){
        angular.element.prototype.scrollTop = function(val){
            var el = this[0];
            var result = this;

            if(this.length > 0){
                if(val === undefined){
                    result = el.scrollTop;
                }
                else{
                    result = this;
                    if(val || val === 0){
                        el.scrollTop = val;
                    }
                }
            }

            return result;
        };
    }

    // Implement the scrollLeft if it is not available
    if(!angular.element.prototype.scrollLeft){
        angular.element.prototype.scrollLeft = function(val){
            var el = this[0];
            var result = this;

            if(this.length > 0){
                if(val === undefined){
                    result = el.scrollLeft;
                }
                else{
                    result = this;
                    if(val || val === 0){
                        el.scrollLeft = val;
                    }
                }
            }

            return result;
        };
    }

    // Implement the offset function if it does not exist
    if(!angular.element.prototype.offset){
        angular.element.prototype.offset = function(){
            var obj = {};
            if(this.length > 0){
                obj = this[0].getBoundingClientRect();
            }
            return obj;
        };
    }

    // Implement the show and hide functions if they don't exist
    if(!angular.element.prototype.show || !angular.element.prototype.hide){
        angular.element.prototype.show = function(){
            if(this.length > 0){
                this[0].style.display = this.data('old-show') || '';
            }
            return this;
        };

        angular.element.prototype.hide = function(){
            var el = this[0];

            if(el){
                // Save the current style
                this.data('old-show', el.style.display);

                // Set the display to none
                el.style.display = 'none';
            }

            return this;
        };
    }
})();