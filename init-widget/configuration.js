var ENV = "development";

var ENVIRONMENT_CONFIGS = {
    development: {
        base_url: 'https://ticklewidget.careclues.com',
    },
    staging: {
        base_url: 'https://chopwidget.careclues.com'
    },
    production: {
        base_url: 'https://widget.careclues.com'
    }
};

var PATHMAP_CONFIGS = {
    clinic_level: 'department-selection',
    department_level: 'doctor-list',
    physician_level: 'slot-selection'
};

var WIDGET_ID = `care_clues_widget_${Math.ceil(Math.random())}`;