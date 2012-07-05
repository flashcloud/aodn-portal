Ext.namespace('Portal.details');

Portal.details.AodaacPanel = Ext.extend(Ext.Panel, {

    constructor: function(cfg) {

        this.selectedProductInfoIndex = 0; // include a drop-down menu to change this index to support multiple products per Layer

        var items = [];
        this._addBlurb( items );
        this._addProductInfo( items );
        this._addSpatialControls( items );
        this._addTemporalControls( items );
        this._addProcessingControls( items );

        var config = Ext.apply({
            id: 'aodaacPanel',
            title: 'AODAAC Partition',
            items: items,
            bodyCls: 'aodaacTab'
        }, cfg );

        Portal.details.AodaacPanel.superclass.constructor.call( this, config );
    },

    initComponent: function(){
        Portal.details.AodaacPanel.superclass.initComponent.call( this );
    },

    update: function( layer, show, hide, target ) {

        Ext.Ajax.request({
            url: 'aodaac/productInfo?layerId=' + layer.grailsLayerId,
            scope: this,
            success: function( resp ) {

                // No productInfo found
                if ( resp.responseText == "[]" ) {

                    hide.call( target, this );
                }
                else {

                    this.productsInfo = JSON.parse( resp.responseText );

                    this._populateFormFields();
                    this._showAllControls();

                    show.call( target, this );
                }
            },
            failure: function() {

                this.body.update( "This feature is currently unavailable for this Layer. Unable to find the required partitioning information." );
            }
        });
    },

    _showAllControls: function() {

        this.spatialControls.show();
        this.temporalControls.show();
        this.processingControls.show();
    },

    _populateFormFields: function() {

        var productInfo = this.productsInfo[ this.selectedProductInfoIndex ];

        // Make 'Product info' text
        var maxTimeText = productInfo.extents.dateTime.max;
        var maxTimeValue = new Date();

        if ( maxTimeText.trim() == "" ) {
            maxTimeText = ', ongoing'
        }
        else {
            maxTimeValue = maxTimeText;
            maxTimeText = " to " + maxTimeText;
        }

        var newText = "";
        newText += productInfo.name + "<br />";
        newText += "Area covered: " + productInfo.extents.lat.min + " N, " + productInfo.extents.lon.min + " E to " + productInfo.extents.lat.max + " N, " + productInfo.extents.lon.max + " E<br />";
        newText += "Time range: " + productInfo.extents.dateTime.min + maxTimeText + "<br />";

        this.productInfoText.update( newText );

        // Populate spatial extent controls
        this.southBL.setValue( productInfo.extents.lat.min );
        this.eastBL.setValue( productInfo.extents.lon.min );
        this.northBL.setValue( productInfo.extents.lat.max );
        this.westBL.setValue( productInfo.extents.lon.max );

        // Populate temporal extent controls
        var timeRangeStart = productInfo.extents.dateTime.min;
        var timeRangeEnd = productInfo.extents.dateTime.max;

        this.dateRangeStartPicker.setMinValue( timeRangeStart );
        this.dateRangeStartPicker.setValue( timeRangeStart );
        this.dateRangeStartPicker.setMaxValue( timeRangeEnd );

        this.dateRangeEndPicker.setMinValue( timeRangeStart );
        this.dateRangeEndPicker.setValue( maxTimeValue ); // From above, handles 'ongoing' data sets
        this.dateRangeEndPicker.setMaxValue( timeRangeEnd );
    },

    _addBlurb: function ( items ) {

        var blurbText = new Ext.Container({
            autoEl: 'div',
            html: "This tool can be used to partition gridded datasets spatially and temporally, and then aggregate the results."
        });

        items.push( blurbText, this._newSectionSpacer() );
    },

    _addProductInfo: function ( items ) {

        var productInfoHeader = new Ext.Container({
            autoEl: 'div',
            html: "<b>Product info</b>"
        });

        // Todo - DN: Add product picker in case of multiple products per Layer

        this.productInfoText = new Ext.Container({
            autoEl: 'div',
            html: "<img src=\"images/spinner.gif\" style=\"vertical-align: middle;\" alt=\"Loading...\">&nbsp;<i>Loading...</i>"
        });

        items.push( productInfoHeader, this.productInfoText, this._newSectionSpacer() );
    },

    _addSpatialControls: function( items ) {

        var spatialExtentText = new Ext.Container({
            autoEl: 'div',
            html: "<b>Spatial Extent</b>"
        });

        var bboxControl = [
            {
                xtype: 'spacer',
                height: 5
            },{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack:'center',
                    align: 'middle'
                },
                width: 300,
                items: [
                    {
                        xtype: 'label',
                        text: OpenLayers.i18n('northBL'),
                        width: 15
                    },
                    {
                        xtype: 'numberfield',
                        ref: '../../northBL',
                        name: 'northBL',
                        decimalPrecision: 2,
                        width: 50,
                        readOnly: true
                    }
                ]
            },{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                width: 300,
                items: [
                    {
                        xtype: 'label',
                        text: OpenLayers.i18n('westBL'),
                        width: 15
                    },
                    {
                        xtype: 'numberfield',
                        name: 'westBL',
                        ref: '../../westBL',
                        decimalPrecision: 2,
                        width: 50,
                        readOnly: true
                    },
                    {
                        xtype: 'label',
                        text: ' ',
                        flex: 1
                    },
                    {
                        xtype: 'numberfield',
                        name: 'eastBL',
                        ref: '../../eastBL',
                        decimalPrecision: 2,
                        width: 50,
                        readOnly: true
                    },
                    {
                        xtype: 'label',
                        text: OpenLayers.i18n('eastBL'),
                        margins: '0 0 0 5',
                        width: 15
                    }
                ]
            },{
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    pack: 'center',
                    align: 'middle'
                },
                width: 300,
                items: [
                    {
                        xtype: 'label',
                        text: OpenLayers.i18n('southBL'),
                        width: 15
                    },
                    {
                        xtype: 'numberfield',
                        name: 'southBL',
                        ref: '../../southBL',
                        decimalPrecision: 2,
                        width: 50,
                        readOnly: true
                    }
                ]
            }
        ];

        // Group controls for hide/show
        this.spatialControls = new Ext.Container({
            items: [spatialExtentText, bboxControl, this._newSectionSpacer()],
            hidden: true
        });

        items.push( this.spatialControls );
    },

    _addTemporalControls: function( items ) {

        var temporalExtentText = new Ext.Container({
            autoEl: 'div',
            html: "<b>Temporal Extent</b>"
        });

        this.timeRangeSlider = new Ext.slider.MultiSlider({
            id: 'timeExtentSlider',
            width: 190,
            minValue: 0,
            maxValue: 96, // (24 hours worth of 15 minute increments)
            values: [0, 96],
            plugins: new Ext.slider.Tip({
                getText: function(thumb){

                    // Get controls
                    var slider = thumb.slider;
                    var startThumb = slider.thumbs[0];
                    var endThumb = slider.thumbs[1];

                    // Format value for reading
                    var timeRangeStart = Portal.details.AodaacPanel._hoursFromThumb( startThumb );
                    var timeRangeEnd = Portal.details.AodaacPanel._hoursFromThumb( endThumb );

                    // Whole day message
                    var wholeDayMessage = "";
                    if ( timeRangeStart == "0:00" && timeRangeEnd == "23:59" ) wholeDayMessage = "<br />(Whole day)";

                    // Emphasise value being modified
                    if ( thumb == startThumb ) timeRangeStart = "<span style=\"font-size: 1.4em;\">" + timeRangeStart + "</span>";
                    if ( thumb == endThumb ) timeRangeEnd = "<span style=\"font-size: 1.4em;\">" + timeRangeEnd + "</span>";

                    return String.format( '{0}&nbsp;-&nbsp;{1}{2}', timeRangeStart, timeRangeEnd, wholeDayMessage );
                }
            })
        });

        var timeRangeSliderContainer = new Ext.Panel({
            fieldLabel: "Time of day",
            height: 'auto',
            layout: 'column',
            items: [
                {
                    xtype: 'label',
                    text: "0:00",
                    style: "padding:0px; margin-top: 16px; margin-right: -32px;"
                },
                this.timeRangeSlider,
                {
                    xtype: 'label',
                    text: "23:59",
                    style: "padding: 0px; margin-top: 16px; margin-left: -28px;"
                }
            ]
        });

        // Calculate dates for max/min
        var today = new Date();
        var yesterday = new Date();
        yesterday.setDate(  today.getDate() - 1  );

        var dateRangeStartPicker = {
            name: 'dateRangeStartPicker',
            ref: '../../dateRangeStartPicker',
            fieldLabel: 'Date from:',
            labelSeparator: '',
            xtype: 'datefield',
            format: 'd/m/Y',
            anchor: '100%',
            showToday: false,
            maxValue: yesterday
        };

        var dateRangeEndPicker = {
            name: 'dateRangeEndPicker',
            ref: '../../dateRangeEndPicker',
            fieldLabel: 'Date to:',
            labelSeparator: '',
            xtype: 'datefield',
            format: 'd/m/Y',
            anchor: '100%',
            showToday: true,
            maxValue: today // Can't select date after today
        };

        var datePickers = {
            xtype: 'container',
            layout: 'form',
            width: 300,
            items: [ dateRangeStartPicker, dateRangeEndPicker, this._newSectionSpacer(), timeRangeSliderContainer]
        };

        // Group controls for hide/show
        this.temporalControls = new Ext.Container({
            items: [temporalExtentText, datePickers, this._newSectionSpacer()],
            hidden: true
        });

        items.push( this.temporalControls );
    },

    _addProcessingControls: function( items ) {

        var processingControlsText = new Ext.Container({
            autoEl: 'div',
            html: "<b>Output</b><br/>If you specify an email address you will be notified by email when the processing is complete."
        });

        this.outputSelector = new Ext.form.ComboBox({
            id: 'outputSelector',
            fieldLabel: 'Output format',
            mode: 'local',
            store: new Ext.data.ArrayStore({
                fields: [ 'code', 'name' ],
                data: [
                    ['nc', 'NetCDF file'],
                    ['hdf', 'HDF file'],
                    ['txt', 'ASCII text'],
                    ['urls', 'List of OPeNDAP URLs']
                ],
                autoDestroy: true
            }),
            value: 'nc', // Default selection
            valueField: 'code',
            displayField: 'name',
            triggerAction: 'all',
            editable: false
        });

        this.emailAddressTextbox = new Ext.form.TextField({
            id: 'emailAddress',
            fieldLabel: 'Email address',
            value: Portal.app.config.currentUser ? Portal.app.config.currentUser.emailAddress : ''
        });

        var startProcessingButton = new Ext.Button({
            text: "Start processing job&nbsp;",
            scale: "medium",
            icon: "images/start.png",
            scope: this,
            handler: this.startProcessing
        });

        // Group controls for hide/show
        this.processingControls = new Ext.Container({
            items: [
                processingControlsText,
                new Ext.Container({
                    layout: 'form',
                    items: [this.outputSelector, this.emailAddressTextbox]
                }),
                this._newSectionSpacer(),
                startProcessingButton
            ],
            hidden: true
        });

        items.push( this.processingControls );
    },

    _newSectionSpacer: function() {

        return new Ext.Spacer({ height: 7 });
    },

    startProcessing: function() {

        var args = "";
        args += "outputFormat=" + this.outputSelector.value;
        args += "&";
        args += "dateRangeStart=" + this.dateRangeStartPicker.value;
        args += "&";
        args += "dateRangeEnd=" + this.dateRangeEndPicker.value;
        args += "&";
        args += "timeOfDayRangeStart=" + this._convertTimeSliderValue( this.timeRangeSlider.thumbs[0].value );
        args += "&";
        args += "timeOfDayRangeEnd=" + this._convertTimeSliderValue( this.timeRangeSlider.thumbs[1].value );
        args += "&";
        args += "latitudeRangeStart=" + this.southBL.value;
        args += "&";
        args += "latitudeRangeEnd=" + this.northBL.value;
        args += "&";
        args += "longitudeRangeStart=" + this.westBL.value;
        args += "&";
        args += "longitudeRangeEnd=" + this.eastBL.value;
        args += "&";
        args += "productId=" + this.productsInfo[ this.selectedProductInfoIndex ].productId;
        args += "&";
        args += "notificationEmailAddress=" + this.emailAddressTextbox.getValue();

        Ext.Ajax.request({
            url: 'aodaac/createJob?' + args,
            scope: this,
            success: function() {

                alert( 'Partitioning job created. Processing now.\n\nIf you supplied an email address we will sent you a notification when the job is complete.\nOtherwise, you can track the progress of the job in the \'Data\' tab of the Portal.' );
            },
            failure: function() {

                alert( 'Unable to create processing job. Please re-check the parameters and try again.' );
            }
        });

        new Portal.ui.AodaacAggregatorJobListWindow().show();
    },

    _convertTimeSliderValue: function( quarterHours ) {

        // 'value' will be 0 - 96 (representing quarter-hours throughout the day)

        var fullHours = Math.floor(quarterHours / 4);
        var partHours = quarterHours % 4;

        var minutePart = ["00", "15", "30", "45"][partHours];
        var hourPart = fullHours;

        // Add leading zeros
        if (fullHours == 0) hourPart = '00';
        else if (fullHours < 10) hourPart = '0' + hourPart;

        return hourPart + '' + minutePart;
    }
});

Portal.details.AodaacPanel._hoursFromThumb = function( thumb ) {

    var value = thumb.value;

    var fullHours = Math.floor(value / 4);
    var partHours = value % 4;

    var quarterHours = ["00", "15", "30", "45"];

    var returnValue = String.format( "{0}:{1}", fullHours, quarterHours[partHours] );

    // Tweak not to show 24:00
    if ( returnValue == "24:00" ) returnValue = "23:59";

    return returnValue;
};
