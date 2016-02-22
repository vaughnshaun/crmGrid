(function () {
    var myModule = angular.module('crm.grid', []);

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

    // Cache the html templates
    myModule.run(['$templateCache', function ($templateCache) {
        $templateCache.put('crm.grid.cell', '<div class="crm-grid-cell" data-crm-grid-cell="" data-index="{{col.index}}" data-ng-repeat="col in viewWindowCols.renderedData track by $index" data-ng-style="{width: col.size + \'px\', left: col.pos + \'px\', height: row.size + \'px\'}" style="position:absolute;"></div>');
        $templateCache.put('crm.grid.fixed.cell', '<div class="crm-grid-cell" data-crm-grid-cell="" data-index="{{$index}}" data-ng-repeat="col in fixedCols track by $index" data-ng-style="{width: col.size + \'px\', left: col.pos + \'px\', height: row.size + \'px\'}" style="position:absolute;"></div>');
        $templateCache.put("crm.grid","<div class=\"crm-grid\" data-ng-class=\"{\'crm-grid-lines-off\': !api.grid.hasGridLines()}\">\r\n    <div data-ng-show=\"hasRenderCols()\" class=\"crm-grid-col-resize-tracker ngHide\"></div>\r\n    <div data-ng-show=\"hasRenderCols()\" class=\"crm-grid-col-headers-container crm-grid-gradient\" style=\"width: 100%;overflow:hidden;\">\r\n        <div data-ng-show=\"fixedCols && fixedCols.length\" class=\"crm-grid-fixed-col-headers-inner\" style=\"position:absolute;\" data-ng-style=\"{width: fixedColsData.totalSize}\">\r\n            <div class=\"crm-grid-col-header crm-grid-gradient\"\r\n                 data-crm-grid-col-header-fixed=\"\"\r\n                 data-index=\"{{col.index}}\"\r\n                 data-ng-repeat=\"col in fixedCols track by $index\"\r\n                 data-ng-style=\"{width: col.size + \'px\'}\"\r\n                 style=\"position:relative;float:left;\">\r\n            </div>\r\n        </div>\r\n        <div class=\"crm-grid-col-headers-inner\" style=\"position:relative;\" data-ng-style=\"{width: viewWindowCols.getContentSize() + \'px\'}\">\r\n            <div class=\"crm-grid-col-header crm-grid-gradient\"\r\n                 data-crm-grid-col-header=\"\"\r\n                 data-index=\"{{col.index}}\"\r\n                 data-ng-repeat=\"col in viewWindowCols.renderedData track by $index\"\r\n                 data-ng-style=\"{width: col.size + \'px\'}\"\r\n                 style=\"position:relative;float:left;\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"crm-grid-viewport-container\" style=\"width:100%;height:100%;position:relative;overflow:hidden;\">\r\n        <!-- Render rows with the fixed cols -->\r\n        <div data-ng-if=\"api.grid.isColumnsVisible()\"\r\n             data-ng-show=\"fixedCols && fixedCols.length\"\r\n             class=\"crm-fixed-cols-container\"\r\n             data-ng-style=\"{width: fixedColsData.totalSize + \'px\'}\"\r\n             style=\"position:absolute;\">\r\n            <div data-crm-grid-row-fixed=\"\"\r\n                 data-ng-repeat=\"row in viewWindowRows.renderedData track by $index\"\r\n                 class=\"renderedRow crm-grid-row crm-fixed-col-row\"\r\n                 data-ng-class=\"{selected: isSelected()}\"\r\n                 data-index=\"{{row.index}}\"\r\n                 style=\"position: absolute;width:100%;\"\r\n                 data-ng-style=\"{top: row.pos + \'px\', height: row.size + \'px\'}\">\r\n\r\n            </div>\r\n        </div>\r\n        <div class=\"crm-grid-viewport\" data-ng-class=\"{\'fixed-col-viewport\': fixedCols && fixedCols.length && hasRenderCols()}\" style=\"width:100%;height:100%;overflow:auto\">\r\n            <div class=\"crm-grid-scroll-container\" data-ng-style=\"{\'min-width\': !hasRenderCols() ? minWidth + \'px\' : undefined }\" style=\"overflow:hidden;height:100%; top: 0px; position: relative;\">\r\n                <div class=\"main-inbox-content\" style=\"height:100%;\">\r\n                    <div data-ng-if=\"!hasRenderCols() && !isColumnsVisible() && api.grid.getData()\"\r\n                         data-crm-grid-row=\"\"\r\n                         data-ng-repeat=\"row in viewWindowRows.renderedData track by $index\"\r\n                         class=\"renderedRow crm-grid-row\"\r\n                         data-ng-class=\"{selected: isSelected()}\"\r\n                         data-index=\"{{row.index}}\"\r\n                         style=\"position: absolute; width: 100%;\"\r\n                         data-ng-style=\"{top: row.pos + \'px\', height: row.size + \'px\'}\">\r\n\r\n                    </div>\r\n\r\n                    <div data-ng-if=\"api.grid.getData() && hasRenderCols()\"\r\n                         data-ng-repeat=\"row in viewWindowRows.renderedData track by $index\"\r\n                         data-crm-grid-row=\"\"\r\n                         class=\"renderedRow crm-grid-row\"\r\n                         data-index=\"{{row.index}}\"\r\n                         data-ng-class=\"{odd: (row.index + 1) % 2 == 1, even: (row.index + 1) % 2 == 0, selected: isSelected()}\"\r\n                         style=\"position: absolute; width: 100%;\"\r\n                         data-ng-style=\"{top: row.pos + \'px\', height: row.size + \'px\'}\">\r\n\r\n                    </div>\r\n\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>");
    }]);

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
                dataA = getValue(fieldname, rowA[fieldname]);
                dataB = getValue(fieldname, rowB[fieldname]);
            }
            else {
                dataA = rowA[fieldname];
                dataB = rowB[fieldname];
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

    myModule.factory('crmGridSelectionApi', ['crmGridUtils', function (crmGridUtils) {

        // This resets the selection manager completely and deselects any local rows
        function fullClearAll() {
            //this.clearAll();
            this._selectionManager.empty();
        }

        // Deselects all local items items
        function clearAll() {
            var items = this.getItems();
            for (var i = 0; i < items.length; i++) {
                this.removeSelection(i);
            }
        }

        // Toggles the item selection by index
        function toggleSelection(index) {
            var row = this.getItemByIndex(index);
            var isSelected = this.isRowSelected(row);
            if (isSelected) {
                this.removeSelection(index);
            }
            else {
                this.addSelection(index);
            }
        }

        // Gets the item by index
        function getItemByIndex(index) {
            return this.getItems()[index];
        }

        // Gets all items
        function getItems() {
            return this._grid.getRows();
        }

        // Does a refresh on the selected items
        function refresh() {

            // Loop through all of the items and update the selected rows
            var gridItems = this.getItems();
            for (var i = 0; i < gridItems.length; i++) {
                this._selectionManager.updateItem(gridItems[i]);
            }
        }

        function updateRowData(data, key) {
            // Find the item by the specified key
            var finalKey = key || this._key;
            finalKey = data[finalKey];
            var item = this._selectionManager.getItemByKey(finalKey);

            // If the item is found replace its data with the new passed in data
            if (item) {
                item.data = data;
            }
        }

        function setSelectionByRange(start, end, keepSelections) {
            if (start > -1 && start < this.getItems().length && start <= end) {
                // First get the number of new selections
                var curRow;
                var rowsToSelect = [];
                var rowsToSelectIndex = [];
                var rowsToClearCount = 0;

                if (!keepSelections) { // If you are not keeping the local selections you need to track the number of local selections
                    var allRows = this.getItems();
                    for (var i = 0; i < allRows.length; i++) {
                        curRow = this.getItemByIndex(i);

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
                        curRow = this.getItemByIndex(i);

                        // If the current row has not been selected yet add it to the rows to be selected
                        if (!this.isRowSelected(curRow)) {
                            rowsToSelect[rowsToSelect.length] = curRow;
                            rowsToSelectIndex[rowsToSelectIndex] = i;
                        }
                    }
                }

                if (rowsToSelect.length > 0) {

                    // The total number of expected selections, based on the number of rows that should be deselected and selected
                    var totalSelections = this._selectionManager.getLength() + rowsToSelect.length - rowsToClearCount;
                    
                    var allowSelection = this._grid.options.selection.beforeSelect(rowsToSelect, rowsToSelectIndex, totalSelections);

                    // If a selection is allowed to push the selections to the selection manager
                    if (allowSelection) {

                        // Clear the previous selections if the user does not want to keep them
                        if (!keepSelections) {
                            this.clearAll();
                        }

                        // Select all of the rows that fall within the range
                        for (var i = start; i <= end; i++) {
                            this._selectionManager.push(this.getItemByIndex(i));
                        }

                        this._grid.options.selection.afterSelect(rowsToSelect, rowsToSelectIndex);
                    }
                }
            }
        }

        function selectAll() {
            if (this.getItems().length) {
                this.setSelectionByRange(0, this.getItems().length - 1, true);
            }
        }

        // Adds a selection even if there is not a local row
        function addSelectionByKey(key) {

            // Add the selection only if the key has not been previously selected
            if (!this.hasSelectedKey(key)) {

                // Find the row and index that this key belongs to
                var index = this._grid.api.grid.getRowIndexByKey(key);
                var row = key;

                if (index !== undefined) {
                    row = this.getItemByIndex(index);
                }

                var totalSelections = this._selectionManager.getLength() + 1;
                var allowSelection = this._grid.options.selection.beforeSelect([row], [index], totalSelections);

                if (allowSelection) {
                    this._selectionManager.push(row);
                    this._grid.options.selection.afterSelect([row], [index]);
                }
            }
        }

        // Removes a selection even if there is not a local row
        function removeSelectionByKey(key) {

            if (this.hasSelectedKey(key)) {
                var index = this._selectionManager.getItemIndexByKey(key); // Get the index of the item in the selection array

                var row;
                var gridIndex;
                if (index !== undefined) {
                    row = this._selectionManager.getItems()[index];
                    gridIndex = this.getItems().indexOf(row);
                }

                this._selectionManager.removeItemByKey(key);

                this._grid.options.selection.afterDeselect(row, gridIndex);
            }
        }

        // Selects a local row by index
        function addSelection(index) {
            var row = this.getItemByIndex(index);

            if (row && !this.isRowSelected(row)) {
                var totalSelections = this._selectionManager.getLength() + 1; // The total number of selections after the selections are made
                var allowSelection = this._grid.options.selection.beforeSelect([row], [index], totalSelections);

                if (allowSelection) {
                    this._selectionManager.push(row);
                    this._grid.options.selection.afterSelect([row], [index]);
                }
            }
        }

        function toggleRowSelection(row){
            var isSelected = this.isRowSelected(row);
            if (isSelected) {
                this.deselectRow(row);
            }
            else {
                this.selectRow(row);
            }
        }

        function selectRow(row) {
            this.addSelectionByKey(row.hash);
        }

        function deselectRow(row) {
            this.removeSelectionByKey(row.hash);
        }

        function setSelectedRows(rows) {
            if (rows) {
                this._selectionManager.empty();
                for (var i = 0; i < rows.length; i++) {
                    this._selectionManager.push(rows[i]);
                }
            }
        }

        // Removes the selection by index from the local rows
        function removeSelection(index) {

            var row = this.getItemByIndex(index);

            if (row && this.isRowSelected(row)) {
                var index = this._selectionManager.getItemIndexByKey(row.hash);
                this._selectionManager.removeItemByKey(row.hash);
            }
        }

        // Clears the selection based on a range
        function clearRange(start, end) {
            var newStart = start !== undefined ? start : 0;
            var newEnd = end !== undefined ? end : items.length - 1;
            for (var i = newStart; i <= newEnd; i++) {
                this.removeSelection(i);
            }
        }

        function doControlClick() {
            this.updateShiftBase(this.getClickIndex());
            this.setFocusedIndex(this.getShiftBaseIndex());
            this.setBaseClickChanged(true);

            var scrollIndex = -1;

            this.toggleSelection(this.getClickIndex());
        }

        function doControlClickByIndex(index) {
            this.updateClickIndex(index);
            this.doControlClick();
            this._$viewPort[0].focus();
        }

        function setBaseClickChanged(changed) {
            this._isBaseClickChanged = changed;
        }

        // Determines is a click changed the shift base
        function isBaseClickChanged() {
            return this._isBaseClickChanged;
        }

        function updateClickIndex(index) {
            this._clickIndex = index;
        }

        function getClickIndex() {
            return this._clickIndex;
        }

        function getFocusedIndex() {
            return this._iterIndex;
        }

        function setFocusedIndex(index) {
            this._iterIndex = index;
        }

        // Updates the the row that was last clicked while the shift key was being held
        function updateShiftBase(index) {
            this._shiftBaseIndex = index;
            this._grid.options.selection.onChangeShiftBase(index);
        }

        function getShiftBaseIndex() {
            return this._shiftBaseIndex;
        }

        function getSelectedRows() {
            return this._selectionManager.getItems(true);
        }

        function getSelectedIds() {
            return this._selectionManager.getKeys();
        }

        function isRowSelected(row) {
            var key = this._key;
            var isSelected;

            if (key) {
                isSelected = this.hasSelectedKey(row.data[key]);
            }
            else {
                isSelected = this.hasSelectedKey(row.hash);
            }

            return isSelected;
        }

        function hasSelectedKey(key) {
            return this._selectionManager.hasKey(key);
        }

        function isSelected(index) {
            var row = this.getItemByIndex(index);
            var hasSelection = false;

            if (row) {
                hasSelection = this.isRowSelected(row);
            }

            return hasSelection;
        }

        function Api(grid, $viewPort) {
            this._grid = grid;
            this._$viewPort = $viewPort;
            this._key = this._grid.options.rowKey;
            var key = this._key;
            this._selectionManager = crmGridUtils.createQuickArrayMap(function (item) {
                var result;
                if (typeof item == 'object') {
                    if (key) {
                        result = item.data[key];
                    }
                    else {
                        result = item.hash;
                    }
                }
                else {
                    result = item;
                }
                return result;
            });
            this._selectedRows = [];
            this._shiftBaseIndex = -1;
            this._clickIndex;
            this._iterIndex = -1;
            this._isBaseClickChanged = false;
        }

        // The public methods
        Api.prototype.refresh = refresh;
        Api.prototype.clearAll = clearAll;
        Api.prototype.toggleSelection = toggleSelection;
        Api.prototype.toggleRowSelection = toggleRowSelection;
        Api.prototype.removeSelection = removeSelection;
        Api.prototype.addSelection = addSelection;
        Api.prototype.addSelectionByKey = addSelectionByKey;
        Api.prototype.setSelectionByRange = setSelectionByRange;
        Api.prototype.setSelectedRows = setSelectedRows;
        Api.prototype.removeSelectionByKey = removeSelectionByKey;
        Api.prototype.clearRange = clearRange;
        Api.prototype.updateShiftBase = updateShiftBase;
        Api.prototype.getShiftBaseIndex = getShiftBaseIndex;
        Api.prototype.getItems = getItems;
        Api.prototype.selectAll = selectAll;
        Api.prototype.getItemByIndex = getItemByIndex;
        Api.prototype.getSelectedRows = getSelectedRows;
        Api.prototype.getSelectedIds = getSelectedIds;
        Api.prototype.updateClickIndex = updateClickIndex;
        Api.prototype.getClickIndex = getClickIndex;
        Api.prototype.doControlClick = doControlClick;
        Api.prototype.doControlClickByIndex = doControlClickByIndex;
        Api.prototype.setBaseClickChanged = setBaseClickChanged;
        Api.prototype.isBaseClickChanged = isBaseClickChanged;
        Api.prototype.getFocusedIndex = getFocusedIndex;
        Api.prototype.setFocusedIndex = setFocusedIndex;
        Api.prototype.fullClearAll = fullClearAll;
        Api.prototype.isRowSelected = isRowSelected;
        Api.prototype.isSelected = isSelected;
        Api.prototype.hasSelectedKey = hasSelectedKey;
        Api.prototype.selectRow = selectRow;
        Api.prototype.deselectRow = deselectRow;

        return {
            createApi: function (grid, $viewPort) {
                return new Api(grid, $viewPort);
            }
        };
    }]);

    myModule.factory('crmGridUtils', ['$http', '$templateCache', '$q', function ($http, $templateCache, $q) {

        // A utility function for the QickArrayMap remove functionality
        function removeItemFromMap(quickArr, item) {
            if (item) {
                delete quickArr._map[quickArr._getCompValue(item)];
            }
        }

        // Pass in a key compare function
        function QuickArrayMap(compFn) {
            this._arr = [];
            this._keys = [];
            this._map = {};
            this._getCompValue = compFn;

            // Determines how values are going to be compared

            if (!this._getCompValue) {
                this._getCompValue = function (item) {
                    return item;
                };
            }
        }

        QuickArrayMap.prototype.push = function (item) {
            var addedItem;
            if (!this.contains(item)) {
                var index = this.getLength();
                var key = this._getCompValue(item);
                this._arr[index] = item;
                this._keys[index] = key;
                this._map[key] = index;
                addedItem = item;
            }
            return addedItem;
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
            var arr;

            // Return the original array if the user wants the original array
            if (original) {
                arr = this._arr;
            }
            else { // Make a copy of the array by default
                arr = [];

                for (var i = 0; i < this.getLength(); i++) {
                    arr[arr.length] = this._arr[i];
                }
            }

            return arr;
        };

        QuickArrayMap.prototype.setItemByKey = function (key, item) {
            if (!this.hasKey(key)) {
                this.push(key);
            }
            else {
                var index = this.getItemIndexByKey(key);
                this._arr[index] = item;
            }
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

        QuickArrayMap.prototype.contains = function (item) {
            return this.getItemIndexByKey(this._getCompValue(item)) !== undefined;
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

            createUnorderedKeyManager: function () {
                return new UnorderedKeyManager();
            },

            createQuickArrayMap: function (fn) {
                return new QuickArrayMap(fn);
            }
        }
    }]);

    // Moves the scroller to the desired col or row based on the index
    function scrollByIndexViewWindow(index, renderData, rowScroll) {
        var viewWindow = this;
        scrollByIndex(index, renderData, viewWindow.$viewPort, viewWindow.$content, rowScroll);
    }
    function scrollByIndex(index, renderData, $viewPort, $content, rowScroll) {

        var scrollBlock = renderData[index];
        var blockEnd = scrollBlock.end;
        var blockPos = scrollBlock.pos;

        if (rowScroll) {
            // Scroll to the top or bottom depending on the position of the row
            var rowTop = blockPos;
            var rowBottom = blockEnd;
            var viewTop = getViewTop($viewPort, $content);
            var viewBottom = getViewBottom($viewPort, $content);
            if (rowTop < viewTop) {
                $viewPort.scrollTop(rowTop);
            }
            else if (rowBottom > viewBottom) {
                var scrollTop = $viewPort.scrollTop();
                $viewPort.scrollTop(scrollTop + (rowBottom - viewBottom));
            }
        }
        else {
            // Scroll to the left or right depending on the position of the column
            var colLeft = blockPos;
            var colRight = blockEnd;
            var viewLeft = getViewLeft($viewPort, $content);
            var viewRight = getViewRight($viewPort, $content);
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

    // This will get a set of functions based on the view window type and if dynamic or fixed sizing is being used
    function updateViewWindowFunctions(viewWindow, isDynamic) {
        var getStartIndex;
        if (viewWindow.isRowView()) {
            if (isDynamic) {
                getStartIndex = function () {
                    return getStartIndexDynamic(viewWindow.$viewPort.scrollTop(), viewWindow.getBlocks());
                };
            }
            else {
                getStartIndex = function () {
                    var size = 1;

                    if(viewWindow.getBlocks()[0]){
                        size = viewWindow.getBlocks()[0].size;
                    }

                    return getStartIndexFixed(viewWindow.$viewPort.scrollTop(), size);
                };
            }

            viewWindow.setContentSize = function (contentSize) {
                if (contentSize !== undefined) {
                    viewWindow.$content.outerHeight(contentSize);
                }
                else {
                    viewWindow.$content.css('height', 'auto');
                }

                viewWindow._contentSize = contentSize;
            };
            viewWindow.getContentSize = function () { return viewWindow._contentSize; };
            viewWindow.getViewPortSize = function () { return viewWindow.$viewPort.outerHeight(); };

        }
        else {
            if (isDynamic) {
                getStartIndex = function (){
                    return getStartIndexDynamic(viewWindow.$viewPort.scrollLeft(), viewWindow.getBlocks());
                };
            }
            else {
                getStartIndex = function () {

                    var size = 1;

                    if (viewWindow.getBlocks()[0]) {
                        size = viewWindow.getBlocks()[0].size;
                    }

                    return getStartIndexFixed(viewWindow.$viewPort.scrollLeft(), size);
                };
            }

            viewWindow.setContentSize = function (contentSize) {
                if (contentSize !== undefined) {
                    viewWindow.$content.outerWidth(contentSize);
                }
                else {
                    viewWindow.$content.css('width', 'auto');
                }

                viewWindow._contentSize = contentSize;
            };
            viewWindow.getContentSize = function () { return viewWindow._contentSize; };
            viewWindow.getViewPortSize = function () { return viewWindow.$viewPort.outerWidth(); };
        }

        viewWindow.getStartIndex = getStartIndex;
    }

    function updateWindowBlockData(viewBlockData) {
        viewBlockData = viewBlockData || {};
        this._blocks = viewBlockData.data || [];
        this._minSize = viewBlockData.minSize, // The smallest block size
        this._maxSize = viewBlockData.maxSize, // The largest block size

        // Add the conditional functions to the viewWindow
        updateViewWindowFunctions(this, viewBlockData.hasDiffSize);

        // Sets the size of the content. This include all blocks even if they haven't been rendered yet
        this.setContentSize(viewBlockData.totalSize);
    }

    // Repositions and resizes the content
    function resyncBlocks() {
        var viewWindow = this;

        //{ size: curSize, pos: totalSize, end: totalSize + curSize, index: i, hash: 'hash' + i }

        var items = viewWindow.getBlocks();
        var curBlock;
        var totalSize = 0;

        var hasDiff = false;
        var maxSize;
        var minSize;

        if (items.length > 0) {
            maxSize = items[0].size;
            minSize = items[0].size;
            for (var i = 0; i < items.length; i++) {
                curBlock = items[i];

                // Update the starting and ending boundary for the block
                curBlock.pos = totalSize;
                curBlock.end = totalSize + curBlock.size;
                curBlock.index = i;

                totalSize += curBlock.size;

                // Get the min and max
                if (curBlock.size > maxSize) {
                    maxSize = curBlock.size;
                    hasDiff = true;
                }

                if (curBlock.size < minSize) {
                    minSize = curBlock.size;
                    hasDiff = true;
                }
            }

            // Set the min and max block sizes
            viewWindow._minSize = minSize;
            viewWindow._maxSize = maxSize;

            // Set the approriate functions based on dynamic or not
            updateViewWindowFunctions(viewWindow, hasDiff);

            // Resize the content container
            viewWindow.setContentSize(totalSize);

            // Update the blocks that should be rendered
            updateRenderData(viewWindow, true);

            viewWindow.updateHeaders();
        }
    }

    // The main update method when a scroll occurs
    function updateRenderData(viewWindow, forceRefresh) {
        
        // Get the min blocks
        var minBlocks = getMinBlocks(viewWindow.getMinBlockSize(), viewWindow.getViewPortSize(), viewWindow.getBlocks().length);

        // Calculate what the first row in the view port should be and get the end based from the first
        var newStart = viewWindow.getStartIndex();

        var newEnd = newStart + minBlocks - 1;

        // Update the current row top row and bottom row only if a new start position occurs and the breakpoints have been triggered
        if (forceRefresh || (newStart !== viewWindow.start && (newStart < viewWindow.startBreakAtIndex || newEnd > viewWindow.endBreakAtIndex))) {
            //viewWindow.updateHeaders();

            // Get the number of rows to render by adding the minimum number of rows and the buffer rows
            var renderedBlocksLength = minBlocks + viewWindow.buffStart + viewWindow.buffEnd;

            // Update the new start and end rows
            viewWindow.start = newStart;
            viewWindow.end = newEnd;

            // Set the break points
            var startMidCount = Math.floor(viewWindow.buffStart / 2);
            var endMidCount = Math.floor(viewWindow.buffEnd / 2);
            viewWindow.endBreakAtIndex = newEnd + endMidCount;
            viewWindow.startBreakAtIndex = newStart - startMidCount;

            // Get the starting index of the rows to render
            var startIndex = 0;

            // Modify the starting index based on the number of top buffer rows
            if (viewWindow.start - viewWindow.buffStart > 0) {
                startIndex = viewWindow.start - viewWindow.buffStart;
            }

            // Get the renderedRows and update the scopes start index
            viewWindow.renderedData = getBlocksByRange(viewWindow.getBlocks(), startIndex, renderedBlocksLength);

            // true - An update occurred
            return true;
        }

        // false - no update occurred
        return false;
    }


    // Gets the start index for blocks that have the same size
    function getStartIndexFixed(scrollPos, blockSize) {
        return Math.floor(scrollPos / blockSize);
    }

    // returns a new array based on the starting index and the number of blocks to return
    function getBlocksByRange(data, start, size) {
        var finalData = [];

        // Make sure the start index is inbounds
        var newStart = 0;
        if (start > 0) {
            newStart = start;
        }

        var length = newStart + size;

        // Make sure the size position is within range
        if (data.length < length) {
            length = data.length;
        }

        // Copy the data over to a new array
        for (var i = newStart; i < length; i++) {
            finalData.push(data[i]);
        }

        return finalData;
    }

    // Sets important sizing and indexing information for grouped rows
    function getViewBlocks(data, defaultSize, hashKey, udfMinSize, rowDataFormatter, overrideSize) {

        // This will be the new array which will set the sizes for the data blocks
        var resultData = [];
        var minSize = 0;
        var maxSize = 0;
        var hasDiff = false;

        var curBlock = 0;
        var curSize = 0;
        var prevSize = 0;
        var totalSize = 0;

        // Does not allow the blocks to get smaller than the limit
        if (udfMinSize !== undefined && defaultSize < udfMinSize) {
            defaultSize = udfMinSize;
        }

        if (data && data.length > 0) {

            var firstBlock = data[0];

            // Default the size of the first block
            if (!firstBlock.size || overrideSize) {
                firstBlock.size = defaultSize;
            }

            if (udfMinSize !== undefined && firstBlock.size < udfMinSize) {
                firstBlock.size = udfMinSize;
            }

            minSize = firstBlock.size;
            maxSize = prevSize = size = minSize;

            for (var i = 0; i < data.length; i++) {
                curBlock = data[i];

                // Add the view block only if it is not hidden
                if (!curBlock.hidden) {

                    // Default the size if it is not available
                    if (!curBlock.size || overrideSize) {
                        curBlock.size = defaultSize;
                    }

                    // Make sure the current block is not less than the min limit
                    if (udfMinSize !== undefined && curBlock.size < udfMinSize) {
                        curBlock.size = udfMinSize;
                    }

                    // Default the size if it is not available
                    curSize = curBlock.size;

                    // Get the min size
                    if (curSize < minSize) {
                        minSize = curSize;
                    }

                    // Get the max size
                    if (curSize > maxSize) {
                        maxSize = curSize;
                    }

                    // Determine if the blocks have different sizes
                    if (prevSize != curSize) {
                        hasDiff = true;
                    }

                    var newHash = 'hash ' + i;

                    if (hashKey) {
                        newHash = curBlock[hashKey] || '';
                    }

                    // The data formatter function
                    var getData;

                    if (rowDataFormatter) {
                        getData = function (fieldname) {
                            var result = '';
                            if (fieldname) {
                                result = rowDataFormatter(this.data, fieldname);
                            }
                            else {
                                result = this.data;
                            }
                            return result;
                        };
                    }
                    else {
                        getData = function () {
                            return this.data;
                        }
                    }

                    // The new block object can be a row or column
                    var obj = {
                        data: curBlock,
                        _userData: {},
                        getData: getData,
                        setUserData: function (key, value) {
                            this._userData[key] = value;
                        },
                        getUserData: function (key) {
                            return this._userData[key];
                        },

                        size: curSize,
                        pos: totalSize,
                        end: totalSize + curSize,
                        index: i,
                        hash: newHash
                    };

                    resultData[resultData.length] = obj;

                    // Save the previous size
                    prevSize = curSize;

                    // Increase the size of the container per block
                    totalSize += curSize;
                }
            }
        }

        return {
            data: resultData,
            maxSize: maxSize,
            minSize: minSize,
            hasDiffSize: hasDiff,
            totalSize: totalSize
        };
    }

    // Gets the minimum blocks based on the height of the size of the view
    function getMinBlocks(minSize, viewSize, numOfRows) {
        var minRows = Math.ceil(viewSize / minSize);

        if (minRows == 0 && numOfRows > 0) {
            minRows = 1;
        }

        return minRows;
    }

    // Gets the start index for for rows or cols that have different sizes
    function getStartIndexDynamic(scrollPos, blocks) {
        // Run a binary search on the collection of data to get the approriate starting index

        // The indexing variables used for tracking the current compare group
        var intersectionIndex = -1,
            start = 0,
            last = blocks.length - 1,
            middle = Math.floor(last / 2);

        var row = blocks[middle];
        var intersectionFound = false;

        // Keep looping until the rows are exhausted are an exact match is found
        while (start <= last && !intersectionFound) {

            if (scrollPos < row.end) {

                // Always update the intersection point with the middle because the last middle is always the correct row
                intersectionIndex = middle;

                // Shrink the last index until you find the smallest one
                last = middle - 1;

            }
            else if (scrollPos > row.end) {
                start = middle + 1;
            }
            else { // Just in case the scroller is at the exactly on the bottom of the row
                intersectionFound = true;
                intersectionIndex = middle;
            }

            // Update the middle to keep doing calculations
            middle = Math.floor((start + last) / 2);
            row = blocks[middle];
        }

        return intersectionIndex;
    }

    myModule.directive('crmGrid', ['crmGridUtils', '$timeout', '$window', function (crmGridUtils, $timeout, $window) {

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
                        size: cur.size
                    };

                    fn(result[result.length - 1], i, {isHidden: cur.isHidden, defaultSize: cur.defaultSize});
                }
            }

            return result;
        }

        return {
            scope: {
                options:'='
            },
            link: function (scope, element, attrs) {

                var thisDirective = this;

                var windowEl = angular.element($window);

                // The constructor for creating a new view window
                function createViewWindow(viewBlockData, isRows) {

                    // Method reference that are passed to the newly created view window object
                    var updateHeaders;
                    var getStartIndex;
                    var getEnd;
                    var getStart;

                    if (isRows) {
                        getStart = function () { return getViewTop($viewPort, $content); };
                        getEnd = function () { return getViewBottom($viewPort, $content); };

                        // Updates the rows of all of the fixed headers
                        updateHeaders = function () {
                            $fixedColsContainer.css('top', -$viewPort.scrollTop() + 'px');
                        };
                    }
                    else {
                        getStart = function () { return getViewLeft($viewPort, $content); };
                        getEnd = function () { return getViewRight($viewPort, $content); };

                        // Attach the update headers function to the viewWindowCols
                        updateHeaders = function () {
                            // update the header container based on the scroll position
                            var firstCol = viewWindow.renderedData[0];

                            // Update the column headers with the horizontal scrollbar only if there are columns present
                            if (firstCol) {
                                var fixedColWidth = 0;

                                if (scope.fixedColsData && scope.api.grid.isColumnsVisible()) {
                                    fixedColWidth = scope.fixedColsData.totalSize;
                                }

                                $colHeaders.css('left', (firstCol.pos - viewWindow.$viewPort.scrollLeft() + fixedColWidth) + 'px');
                            }

                        };
                    }

                    var viewWindow = {
                        $viewPort: $viewPort, // The view port
                        $content: $content, // The content container that holds all of the rows
                        buffStart: 2, // The number of blocks to hide under the starting portion of the view port
                        buffEnd: 2, // The number of blocks to hide under the ending portion of the view port
                        startBreakAtIndex: -1, // Whenever the new start row is less than this index a new set of rows will be loaded
                        endBreakAtIndex: -1, // Whenever the new end row is greater than this index a new set of rows will be loaded
                        start: undefined, // The current start block
                        end: -1, // The current end block
                        // The main virtualization function callbacks
                        scrollToByIndex: function (index) { scrollByIndexViewWindow(index, this.getBlocks(), this.$viewPort, this.$content, isRows); },
                        getStart: getStart, // The starting position of the container
                        getEnd: getEnd, // The end of the container
                        updateHeaders: updateHeaders, // Handles the position of the fixed header container and fixed column rows. This is updated relative to the scrollbars
                        _blocks: undefined,
                        _minSize: undefined, // The smallest block size
                        _maxSize: undefined, // The largest block size
                        _contentSize: undefined,
                        updateBlockData: updateWindowBlockData,
                        getBlocks: function () { return this._blocks; },
                        getMinBlockSize: function () { return this._minSize; },
                        getMaxBlockSize: function () { return this._maxSize; },
                        isRowView: function () { return this._isRowView; },
                        _isRowView: isRows, // Tells if this view window handles rows
                        renderedData: [], // The blocks of data that are currently part of the viewport
                        resync: resyncBlocks
                    };

                    viewWindow.updateBlockData(viewBlockData);

                    return viewWindow;
                }

                var $crmGrid;
                var $viewPort;
                var $viewPortContainer;
                var $fixedColsContainer;
                var $content;
                var $colHeaders;
                var $colHeadersContainer;

                var defaultMinColWidth = 50;
                var minColWidth = 50;

                // Get the min col width from the user or the default
                if(scope.options.minColWidth === undefined){
                    minColWidth = defaultMinColWidth;
                }

                // Set the default col width to the min col width if it is not defined
                if (scope.options.colWidth === undefined) {
                    scope.options.colWidth = minColWidth;
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

                function resizeViewport() {
                    $viewPort.outerHeight(element.outerHeight() - $colHeadersContainer.outerHeight());
                    $viewPortContainer.outerHeight($viewPort.outerHeight());

                    if (scope.fixedColsData && scope.api.grid.isColumnsVisible()) {
                        var fixedColsWidth = scope.fixedColsData.totalSize;
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

                function createGrid() {
                    // The virtualization object
                    $crmGrid = angular.element((element[0].getElementsByClassName('crm-grid')[0])); // The view port
                    $viewPort = angular.element((element[0].getElementsByClassName('crm-grid-viewport')[0])); // The view port
                    $content = angular.element((element[0].getElementsByClassName('crm-grid-scroll-container')[0])); // The content container that holds all of the rows and cols
                    $colHeaders = angular.element((element[0].getElementsByClassName('crm-grid-col-headers-inner')[0]));
                    $colHeadersContainer = angular.element((element[0].getElementsByClassName('crm-grid-col-headers-container')[0]));
                    $viewPortContainer = angular.element(element[0].getElementsByClassName('crm-grid-viewport-container')[0]);
                    refreshFixedColsEl();

                    // Create the view windows for the cols and the rows
                    var viewWindowRows = scope.viewWindowRows = createViewWindow(undefined, true);
                    var viewWindowCols = scope.viewWindowCols = createViewWindow(undefined);

                    // Get fixed columns if they exist
                    var fixedColWidth = 0;
                    if (scope.options.fixedCols) {
                        scope.fixedColsData = getViewBlocks(scope.options.fixedCols, scope.options.colWidth, undefined, minColWidth);
                        scope.fixedCols = scope.fixedColsData.data;
                        fixedColWidth = scope.fixedColsData.totalSize;
                    }

                    // Set the view ports initial height
                    resizeViewport();

                    scope.api.grid.blur = function () {
                        $viewPort.blur();
                    };

                    scope.api.grid.focus = function () {
                        $viewPort.focus();
                    };

                    scope.api.grid.resizeViewport = function () {
                        resizeViewport();
                        $timeout(function () {
                            refreshRenderBlocks();
                        });
                    };

                    // This does a full refresh of the columns
                    function refreshRenderCols(cols) {

                        // If the columns are hidden pass block cols to the getViewBlocks function
                        if (!scope.api.grid.isColumnsVisible()) {
                            cols = [];
                        }

                        // Get the new set of columns and update the view window for the columns
                        if (cols && cols.length) {
                            var colData = getViewBlocks(cols, scope.options.colWidth, undefined, minColWidth);
                            scope.setCols(colData.data);
                            viewWindowCols.updateBlockData(colData);
                            updateRenderData(viewWindowCols, true);
                            viewWindowCols.updateHeaders();
                        }
                        else {
                            // Reset the content size to the full width if there are no columns
                            viewWindowCols.setContentSize(undefined);
                            viewWindowCols.renderedData = [];
                        }
                    }

                    // This does a full refresh of the rows
                    function refreshRenderRows(rows) {

                        // Get the new rows and update the view window for the rows
                        if (rows && rows.length) {
                            var rowData = getViewBlocks(rows, scope.api.grid.getRowHeight(), scope.options.rowKey, undefined, scope.options.rowDataFormatter, true);
                            scope.setRows(rowData.data);
                            viewWindowRows.updateBlockData(rowData, true);
                            updateRenderData(viewWindowRows, true);

                            // Update the data that is in the selected rows
                            if(scope.api.selection){
                                // This inserts the appropriate grid data into the selected row
                                scope.api.selection.refresh();
                            }
                        }
                        else {
                            viewWindowRows.renderedData = [];
                            viewWindowRows.setContentSize(undefined);
                        }
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

                        refreshRenderCols(scope.getVisibleColumns());
                        refreshRenderRows(scope.api.grid.getData());

                    }

                    scope.$watch('hasRenderCols()', function () {
                        //viewWindowCols.updateHeaders();
                        refreshRenderBlocks();

                        $timeout(function () {
                            resizeViewport();
                            refreshFixedColsEl();
                            viewWindowCols.updateHeaders();
                        });
                    });

                    scope.$watch('getVisibleColumns()', function () {
                        refreshRenderCols(scope.getVisibleColumns());
                    });

                    /*scope.$watch('api.grid.getData()', function () {
                        refreshRenderRows(scope.api.grid.getData());
                    });*/

                    // update the rows if the window is adjusted
                    element.css('position', 'relative');
                    //var oldHeight = $(window).height();
                    var oldHeight = $window.innerHeight;
                    windowEl.on('resize', scope.api.grid.resizeViewport);

                    // Set a render delay for slower browsers like IE and Safari
                    // This allows for smooth scrolling
                    var renderFuncYId;
                    var renderFuncXId;
                    var renderFuncId;
                    var renderDelay = 0;
                    var updateOnScroll = true;

                    var oldScrollX = 0;
                    var oldScrollY = 0;
                    $viewPort.on('scroll', function (evt) {
                        // update the header container based on the scroll position
                        if (scope.hasRenderCols()) {
                            viewWindowCols.updateHeaders();
                        }

                        // Moves the fixed columns rows with the vertical scroller
                        if (scope.options.fixedCols && scope.options.fixedCols) {
                            viewWindowRows.updateHeaders();                            
                        }

                        $timeout(function () {
                            var isUpdatedY = false;
                            var isUpdatedX = false;

                            if (viewWindowRows) {
                                isUpdatedY = updateRenderData(viewWindowRows);

                                // Moves the fixed columns rows with the vertical scroller
                                if (scope.options.fixedCols && scope.options.fixedCols) {
                                    viewWindowRows.updateHeaders();
                                }
                            }

                            // Check the columns if they are loaded
                            if (scope.hasRenderCols()) {
                                isUpdatedX = updateRenderData(viewWindowCols);

                                if (isUpdatedX) {
                                    // update the header container based on the scroll position
                                    viewWindowCols.updateHeaders();
                                }
                            }
                        });
                    });

                    // Do the column resizing
                    var mouseMoveColDrag;
                    var mouseUpColDrag;

                    var currentWidth;
                    var nextWidth;

                    function getColWidthByMouse(col, event) {
                        if (col && col.length) {
                            return event.pageX - col.offset().left;
                        }
                    }

                    if (scope.options.resizeColumns === undefined || scope.options.resizeColumns) {
                        var colDrag;
                        var colDragNext;
                        var initColWidth;
                        var initNextWidth;
                        var colDragIndex; // The full index of the column that is targeted
                        var colResizeTracker = angular.element(element[0].getElementsByClassName('crm-grid-col-resize-tracker'));
                        $colHeaders.on('mousedown', function (event) {
                            var $mainTarget = angular.element(event.target);
                            colDrag = undefined; // Reset the column that is being dragged
                            colDragIndex = -1;
                            if (scope.hasRenderCols() && $mainTarget.hasClass('resize-handle')) {

                                // Now iterate through all of the col headers and find the the intersecting header
                                //var allHeaders = $colHeaders.find('.crm-grid-col-header');

                                colDrag = $mainTarget.parent();
                                colDragNext = colDrag.next();

                                // Reset the widths
                                initColWidth = currentWidth = getColWidthByMouse(colDrag, event);
                                initNextWidth = getColWidthByMouse(colDragNext, event);

                                // Get the index of the column by passing the right side of the column
                                colDragIndex = parseInt(colDrag.attr('data-index'));

                                // Make the tracker visible whenever a column is targeted
                                $crmGrid.addClass('resizing-col');
                                colResizeTracker.outerHeight($colHeadersContainer.outerHeight() + $viewPort.outerHeight());
                                colResizeTracker.css('left', (viewWindowCols.getBlocks()[colDragIndex].end - $viewPort.scrollLeft() + fixedColWidth) + 'px');
                                colResizeTracker.removeClass('ngHide');
                                event.preventDefault();
                            }

                        });

                        // Tracks what the width should be for the current column that is being resized
                        mouseUpColDrag = function (event) {
                            if (scope.hasRenderCols()) {
                                // Resize the column when the mouse is released only if a column is selected for resizing
                                if (colDrag) {
                                    // Update the column widths and hide the resize column tracker
                                    var cols = viewWindowCols.getBlocks();
                                    cols[colDragIndex].size = currentWidth;
                                    cols[colDragIndex].data.size = currentWidth;

                                    $crmGrid.removeClass('resizing-col');
                                    $timeout(function () {
                                        viewWindowCols.resync();
                                        //scope.$digest();
                                        colResizeTracker.addClass('ngHide');
                                        if (scope.options.onColumnResizeDone) {
                                            scope.options.onColumnResizeDone(cols[colDragIndex].data.value, cols[colDragIndex].size);
                                        }
                                    });

                                    colDrag = undefined;
                                    colDragNext = undefined;
                                }
                            }
                        };

                        mouseMoveColDrag = function (event) {
                            if (scope.hasRenderCols()) {
                                if (colDrag) {
                                    var colDragData = viewWindowCols.getBlocks()[colDragIndex];
                                    //var colDragRight = colDrag.outerWidth();
                                    var colDragLeft = colDrag.offset().left;

                                    currentWidth = getColWidthByMouse(colDrag, event);

                                    // Do the boundary check for the column widths
                                    // Make sure the column is not dragged past the container limit
                                    var colPosRelToView = colDrag.offset().left - viewWindowCols.$viewPort.offset().left;
                                    /*if (colPosRelToView + currentWidth > viewWindowCols.$viewPort.outerWidth()) {
                                        currentWidth = viewWindowCols.$viewPort.outerWidth() - colPosRelToView;
                                    }*/

                                    // Make sure the column is not dragged past the containers left
                                    if (currentWidth + colPosRelToView <= 0) {
                                        currentWidth = -colPosRelToView;
                                    }

                                    // Make sure the column is no smaller than the set minimum width
                                    if (currentWidth < minColWidth) {
                                        currentWidth = minColWidth;
                                    }

                                    // Update the column resize tracker position
                                    colResizeTracker.css('left', (colDragData.pos + currentWidth - $viewPort.scrollLeft() + fixedColWidth) + 'px');
                                }
                            }
                        };

                        windowEl.on('mouseup', mouseUpColDrag);
                        windowEl.on('mousemove', mouseMoveColDrag);
                    }

                    // Add the cell resize api if the grid is displaying columns
                    scope.api.cellResize = {
                        resync: function () { viewWindowCols.resync(); }
                    };

                    // Attach the grid refresh method to the grid api
                    scope.api.grid.refresh = function () {
                        refreshRenderRows(scope.api.grid.getData());
                    };

                    // Set the initial data rows
                    scope.api.grid.setData(scope.options.data);

                    scope.api.grid.scrollTop = function (pos) {
                        var result;
                        if (pos === undefined) {
                            result = $viewPort.scrollTop();
                        }
                        else {
                            result = $viewPort.scrollTop(pos);
                        }
                        return result;
                    };

                    scope.api.grid.scrollLeft = function (pos) {
                        var result;
                        if (pos === undefined) {
                            result = $viewPort.scrollLeft();
                        }
                        else {
                            result = $viewPort.scrollLeft(pos);
                        }
                        return result;
                    };

                    // The grid registration callback
                    if (scope.options.onRegister) {
                        scope.options.onRegister(scope.api);
                    }

                    scope.$on('$destroy', function () {
                        if (mouseMoveColDrag) {
                            $window.off('mousemove', mouseMoveColDrag);
                            $window.off('mouseup', mouseUpColDrag);
                        }

                        $window.off('resize', scope.grid.api.resizeViewport);
                    });

                    // Save the application scope
                    scope.appScope = thisDirective.appScope = scope.$parent;
                }
            },
            controller: function ($scope) {

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

                if ($scope.options.fields) {
                    // Make a deep copy of the passed in table fields so that crm grid doesn't affect the entire app
                    avFields = copyFieldData($scope.options.fields, function (field, index, privateFields) {
                        // Copy the initial set of visible columns
                        if (!privateFields.isHidden) {
                            colData[colData.length] = field;
                        }

                        // The field name should append a count if it already exist
                        if(!avFieldsMap[field.value]){
                            avFieldTempCount[field.value] = 1;
                            avFieldsMap[field.value] = field;
                        }
                        else{
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

                var rowHeight;

                // Determines if columns are turned on for rendering
                var colsOn = $scope.options.showCols;

                // The row data that is passed in from a application
                var data = [];

                $scope.minWidth = $scope.options.minWidth;

                var gridLinesOn = $scope.options.showGridLines === undefined ? true : $scope.options.showGridLines;

                // This method is only avialable to the crm grid
                $scope.getVisibleColumns = function () {
                    return colData;
                };

                // Do the initial api set up
                $scope.api = this.api = {
                    grid: {
                        hasGridLines: function(){
                            return gridLinesOn;
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
                            curSort = newSort || [];

                            if (rowData && curSort.length > 0) {
                                rowData.sort(function (a, b) {
                                    return getMultiSortValue(a, b, curSort);
                                });
                            }
                            this.refresh();
                        },
                        setData: function (data, newSort) {
                            rowData = data || [];
                            curSort = newSort || [];

                            // If the sort exist then call the sort method otherwise just do a refresh
                            if (curSort.length > 0) {
                                this.sort();
                            }
                            else {
                                this.refresh();
                            }
                        },
                        refresh: function(){},
                        getData: function () {
                            return rowData;
                        },
                        getRows: function(){
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
                        },
                        setVisibleColumns: function (indices, restoreWidthOnHide) { // Array of indices to display
                            // Deep copy the col properties
                            //template, value, getText, isHidden, width
                            colData = [];
                            var index;
                            var dupMap = {};

                            // Add the visible columns to the col data
                            for (var i = 0; i < indices.length; i++) {
                                index = indices[i];

                                // Check for duplicates and for a present fields
                                if (!dupMap[index] && avFields[index]) {
                                    dupMap[index] = true;
                                    colData[colData.length] = avFields[index];
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
                        setColumnsVisible: function (on) {
                            colsOn = on;
                        },
                        isColumnsVisible: function () {
                            return colsOn;
                        }
                    }
                };

                $scope.options = $scope.options || {};

                this.options = $scope.options;
                $scope.getRows = this.getRows = function () {
                    return rows;
                };

                $scope.setRows = this.setRows = function (d) {
                    rows = d;
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

                // Set the initial row height
                rowHeight = $scope.options.rowHeight;

            },
            //templateUrl: 'lib/base/crmGrid.html',
            templateUrl: 'crm.grid',
            priority: 0,
        };
    }]);

    myModule.directive('crmGridSelection', ['crmGridSelectionApi', function (crmGridSelectionApi) {
        return {
            priority: 1,
            require: '^crmGrid',
            link: function (scope, element, attrs, controllerGrid) {

                var $viewPort = angular.element((element[0].getElementsByClassName('crm-grid-viewport')[0])); // The view port

                var options = controllerGrid.options;

                // An api instance for this selection directive
                var selectionApi = controllerGrid.api.selection = crmGridSelectionApi.createApi(controllerGrid, $viewPort);

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

                selectionOptions.beforeSelect = selectionOptions.beforeSelect || function (row, index, totalSelectionsAfter) { return true; };
                selectionOptions.afterSelect = selectionOptions.afterSelect || function (row, index) { };
                selectionOptions.afterDeselect = selectionOptions.afterDeselect || function (row, index) { };
                selectionOptions.onChangeShiftBase = selectionOptions.onChangeShiftBase || function (shiftRow, index) { };
                selectionOptions.commandDone = selectionOptions.commandDone || function (index) { };
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
                function getItemEl(index) {
                    return $viewPort.find('[' + rowIndexAttr + '="' + index + '"]');
                }

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

                        var curRowIndex = -1;
                        var scrollRowIndex = evt.which == key_down ? selectionApi.getFocusedIndex() + 1 : selectionApi.getFocusedIndex() - 1;

                        // go to the next/prev row else stay on the same row, Handles arrow tracking
                        if (arrowDir == evt.which || arrowDir == undefined || !evt.shiftKey) {
                            curRowIndex = scrollRowIndex;
                        }
                        else {
                            curRowIndex = selectionApi.getFocusedIndex();
                        }

                        // update the travel direction
                        arrowDir = evt.which;

                        // Make sure the row that the user wants to move to is within range
                        if (curRowIndex > -1 && curRowIndex < selectionApi.getItems().length && selectionOptions.validateSelectionCycle(selectionApi.getItemByIndex(curRowIndex))) {

                            // Wipeout the uneeded rows from the shift click
                            if (scope.isCtrlAndShiftClick && evt.shiftKey) {

                                var index = selectionApi.getFocusedIndex();
                                var baseIndex = selectionApi.getShiftBaseIndex();

                                if (index < baseIndex) {

                                    // Clear all after the current shift base
                                    selectionApi.clearRange(baseIndex + 1);
                                    // Clear all previous to the current control click
                                    selectionApi.clearRange(0, index - 1);
                                }
                                else if (index > baseIndex) {

                                    // Clear all before the current shift base
                                    selectionApi.clearRange(0, baseIndex - 1);
                                    // Clear all after the current control click
                                    clearRange(index + 1);
                                }
                            }

                            isCtrlAndShiftClick = false;

                            // Go to next row
                            selectionApi.setFocusedIndex(curRowIndex);

                            // Clears all selections if the base is changed due to a click
                            if (selectionApi.isBaseClickChanged() == true) {
                                clearAllSelections();
                                selectionApi.setBaseClickChanged(false);
                            }

                            // if no shift, clear all selections and select the first
                            if (!evt.shiftKey) {
                                clearAllSelections();
                                selectionApi.updateShiftBase(curRowIndex);
                            }
                            else {

                                // Make sure the multi select does not disturb the current base
                                var baseIndex = selectionApi.getShiftBaseIndex();

                                selectionApi.addSelection(baseIndex);

                                if (selectionApi.getFocusedIndex() == baseIndex) {
                                    scrollRowIndex = curRowIndex = evt.which == key_down ? selectionApi.getFocusedIndex() + 1 : selectionApi.getFocusedIndex() - 1;
                                }

                            }

                            // If in range update the iterIndex and perform the logic
                            if (curRowIndex > -1 && curRowIndex < selectionApi.getItems().length) {

                                // Update the current row
                                selectionApi.setFocusedIndex(curRowIndex);

                                //var $scroll = $(scope.$items[scrollRowIndex]);
                                var scrollRow = selectionApi.getItemByIndex(scrollRowIndex);
                                if (selectionApi.isRowSelected(scrollRow)) {
                                    evt.which == key_down ? scrollRowIndex++ : scrollRowIndex--;
                                }

                                // Toggle the current row selection
                                selectionApi.toggleSelection(selectionApi.getFocusedIndex());

                                // Update the scroller position
                                if (selectionOptions.autoScrollFocus) {
                                    scrollByIndex(scrollRowIndex, selectionApi.getItems(), $viewPort, $content, true);
                                }
                            }
                        }

                        scope.$apply(function () {
                            selectionOptions.commandDone(scrollRowIndex);
                        });
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

                        selectionApi.updateClickIndex(parseInt($this.attr(rowIndexAttr), 10));
                        var thisIndex = selectionApi.getClickIndex();

                        // Return if the click item is not an item
                        if (isNaN(thisIndex)) {
                            return;
                        }

                        var beforeClickReturn = selectionOptions.beforeClick($this, thisIndex, $target);
                        if (beforeClickReturn === false) {
                            return;
                        }

                        var isControlOrShift = evt.shiftKey || evt.ctrlKey;

                        // Only select one if it is not a special selection key
                        if (!isControlOrShift) {
                            selectionApi.updateShiftBase(thisIndex);
                            selectionApi.setBaseClickChanged(true);
                            selectionApi.setFocusedIndex(selectionApi.getShiftBaseIndex());

                            if (selectionOptions.singleClickClear) {
                                clearAllSelections();
                            }

                            selectionApi.addSelection(thisIndex);
                        }
                        else if (evt.shiftKey) {
                            isCtrlAndShiftClick = true;

                            // Save the initial base click, if no shift base set the shift base to the first
                            if (selectionApi.getShiftBaseIndex() < 0) {
                                selectionApi.updateShiftBase(0);
                            }

                            selectionApi.setBaseClickChanged(false);

                            var baseIndex = selectionApi.getShiftBaseIndex();
                            var startIndex;
                            var endIndex

                            // Determine the start and end range for the local selections
                            if (thisIndex > baseIndex) {
                                arrowDir = key_down; // reset the key movement orientation
                                startIndex = baseIndex;
                                endIndex = thisIndex;
                            }
                            else {
                                arrowDir = key_up; // reset the key movement orientation
                                startIndex = thisIndex;
                                endIndex = baseIndex;
                            }

                            // Loop and add the selections
                            if (!evt.ctrlKey) {
                                selectionApi.setSelectionByRange(startIndex, endIndex, false);
                                isCtrlAndShiftClick = false;
                            }
                            else {
                                selectionApi.setSelectionByRange(startIndex, endIndex, true);
                            }

                            selectionApi.setFocusedIndex(thisIndex);
                        }
                        else if (evt.ctrlKey) {
                            selectionApi.doControlClick();
                        }

                        if (selectionOptions.autoScrollFocus) {
                            scrollByIndex(thisIndex, selectionApi.getItems(), $viewPort, $content, true);
                        }

                        scope.$apply(function () {
                            selectionOptions.commandDone(thisIndex);
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
    }]);

    myModule.directive('crmGridRow', ['$compile', '$templateCache', function ($compile, $templateCache) {
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

                        if (!scope.hasRenderCols()) { // Get the appropriate html for the standard row view
                            if(scope.options.rowTemplate){
                                if (!rowOnlyLinker) {
                                    rowOnlyLinker = $compile(angular.element(scope.options.rowTemplate));
                                }

                                element.append(rowOnlyLinker(scope, function (clone) {
                                    return clone;
                                }));
                            }
                        }
                        else { // Get the appropriate html for the header (non fixed cols) view
                            if (scope.options.rowCellTemplate) { // Add the template
                                if (!customRowCellLinker) {
                                    // Turn the template into an element
                                    var rowTemplateEl = angular.element(scope.options.rowCellTemplate);

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
    }]);

    myModule.directive('crmGridRowFixed', ['$compile', '$templateCache', function ($compile, $templateCache) {

        var cellHtml = $templateCache.get('crm.grid.fixed.cell');
        return {
            compile: function () {
                var linkerFn;
                var linkerCustomFn;
                return {
                    post: function (scope, element, attrs, controllers) {
                        
                        if (scope.options.rowCellTemplate) { // Add the template
                            if (!linkerCustomFn) {
                                // Turn the template into an element
                                var rowTemplateEl = angular.element(scope.options.rowCellTemplate);

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
    }]);

    var defaultColHeaderHtml = '<span data-ng-if="!col.data.label">&nbsp;</span><label data-ng-if="col.data.label !== undefined && col.data.label != \'\'">{{col.data.label}}</label>';
    // Setups basic logic for the col header directives
    function createColHeaderDirective(scope, element, attrs, $compile, resizeHtml) {
        var templateFuncs = {};
        scope.$watch('col.data.headerTemplate', function () {

            var template = scope.col.data.headerTemplate;

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

    myModule.directive('crmGridColHeaderFixed', ['$compile', function ($compile) {

        var resizableHtml = '<div class="resize-handle"></div>'

        return {
            link: function (scope, element, attrs) {
                createColHeaderDirective(scope, element, attrs, $compile);
            },
            template: defaultColHeaderHtml
        };
    }]);

    myModule.directive('crmGridColHeader', ['$compile', function ($compile) {

        var resizableHtml = '<div class="resize-handle"></div>';

        return {
            link: function(scope, element, attrs){
                createColHeaderDirective(scope, element, attrs, $compile, resizableHtml);
            },
            template: defaultColHeaderHtml + resizableHtml
        };
    }]);

    myModule.directive('crmGridCell', ['$compile', '$filter', function ($compile, $filter) {
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
    }]);

    myModule.directive('crmGridColumnMove', [function () {
        return {
            priority: 3,
            link: function (scope, element, attrs) {

            }
        };
    }]);
})();