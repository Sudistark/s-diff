define(
    [
        'models/services/search/jobs/Summary',
        'models/datasets/Column'
    ],
    function(
        SummaryModel,
        ColumnModel
    ) {
        return SummaryModel.extend({
            initialize: function() {
                SummaryModel.prototype.initialize.apply(this, arguments);
            }
        },
        {
            Fields: SummaryModel.Fields.extend(
                {
                    getFieldPickerItems: function() {
                        return this.map(function(field) {
                            var fieldName = field.get('name'),
                                type = 'string';

                            if (fieldName === '_raw') {
                                type = ColumnModel.TYPES._RAW;
                            } else if (fieldName === '_time') {
                                type = ColumnModel.TYPES._TIME;
                            } else if (field.isNumeric()) {
                                type = ColumnModel.TYPES.NUMBER;
                            } 

                            return {
                                value: field.get('name'),
                                type: type 
                            };
                        });
                    }
                }
            )
        });
    }
);