
// {
//     clinic_slug: 'all-asia-medical-institute-aami-8b-near-pantaloons-gariahat-garcha-1st-lane-ballygunge',
//     department: 'Arthroscopy',
//     physician_slug: 'ani-bhadra-99',
//     location_type: 'clinic_level/department_level/physician_level'
// }

/**
 * 
 * @param {*} params clinic_slug, department, physician_slug: 'ani-bhadra-99', location_type: 'clinic_level/department_level/physician_level'
 */
function initCareCluesWidget(params) {
    if (isParamsValid(params) === true) {
        let resolvedEndpoint = getResolvedEndpoint(params);
        let widgetUrl = getWidgetUrl(resolvedEndpoint);
        embedWidget(widgetUrl);
    }
    else {
        throw "invalid widget parameters";
    }
}

function isParamsValid(params) {
    let validationStatus = false;
    if (params.hasOwnProperty('location_type')) {
        let locationType = params.location_type;
        switch (locationType) {
            case 'clinic_level':
                validationStatus = params.hasOwnProperty('clinic_slug');
                validationStatus = validationStatus === true ? params.clinic_slug.length > 0 : false;
                break;
            case 'department_level':
                validationStatus = params.hasOwnProperty('clinic_slug') && params.hasOwnProperty('department');
                validationStatus = validationStatus === true ? params.clinic_slug.length > 0 && params.department.length > 0 : false;
                break;
            case 'physician_level':
                validationStatus = params.hasOwnProperty('clinic_slug') && params.hasOwnProperty('physician_slug');
                validationStatus = validationStatus === true ? params.clinic_slug.length > 0 && params.physician_slug.length > 0 : false;
                break;
            default:
                validationStatus = false;
                break;
        }
    }
    return validationStatus;
}

function getResolvedEndpoint(params) {
    let locationType = params.location_type;
    let endPointPath = PATHMAP_CONFIGS[locationType];
    let clinicSlug = params.clinic_slug;
    let resolvedEndpoint = `${endPointPath}/${clinicSlug}`;
    switch (locationType) {
        case 'department_level':
            let departmentName = params.department;
            resolvedEndpoint = `${resolvedEndpoint}/${departmentName}`;
            break;
        case 'physician_level':
            let physicianSlug = params.physician_slug;
            resolvedEndpoint = `${resolvedEndpoint}/${physicianSlug}`;
            break;
        default:
            break;
    }
    return resolvedEndpoint;
}

function getWidgetUrl(resolvedEndpoint) {
    return `${ENVIRONMENT_CONFIGS[ENV].base_url}/${resolvedEndpoint}`;
}

function embedWidget(widgetUrl) {
    let widgetExists = isWidgetPresent();
    if (widgetExists === true) {
        removeWidget();
    }
    createModalPopup();
    createWidget(widgetUrl);
}

function isWidgetPresent() {
    let widgetSelector = document.getElementById(WIDGET_ID);
    return widgetSelector != null;
}

function createModalPopup() {

    let containerElement = document.getElementById('careclues_widget_container');

    let modalDivElement = document.createElement('div');
    modalDivElement.classList.add("cc_OuterContainerArea");
    modalDivElement.id = WIDGET_ID;
    modalDivElement.style.cssText = `position: fixed; z-index: 999; left: 0; top: 0; width: 100%;  height: 100%; overflow: auto; background-color: rgb(0,0,0); background-color: rgba(0,0,0,0.4);`;

    let modalContentDivElement = document.createElement('div');
    modalContentDivElement.id = `modal-content-${WIDGET_ID}`;
    modalContentDivElement.classList.add("cc_InnerContainerArea");
    //modalContentDivElement.style.cssText = `background-color: #fefefe; margin: 8% auto; padding: 20px; border: 1px solid #888; width: 70%;`;

    let modalCloseSpanElement = document.createElement('span');
    modalCloseSpanElement.id = `modal-close-${WIDGET_ID}`;
    modalCloseSpanElement.classList.add("cc_TotalContainerClose");
    modalCloseSpanElement.innerHTML = `&times;`;
    //modalCloseSpanElement.style.cssText = `color: #aaa; float: right; font-size: 28px; font-weight: bold;build-widget-initiator:devcursor: pointer;`;
    //modalCloseSpanElement.setAttribute("onClick", removeWidget);
    modalCloseSpanElement.addEventListener('click', removeWidget, false);

    let customStyleSheet = document.createElement('style');
    customStyleSheet.type = 'text/css';
    customStyleSheet.appendChild(document.createTextNode(`
        .cc_OuterContainerArea {
            display: flex;
            align-items: center;
        }
        .cc_InnerContainerArea {
            width: 100%;
            margin-right: auto;
            margin-left: auto;
            box-shadow: 0 14px 30px 2px rgba(0,0,0,.15);
            position: relative;
        }
        .cc_InnerContainerArea:before {
            content: " ";
            display: table;
            box-sizing: border-box;
        }
        .cc_InnerContainerArea:after {
            content: " ";
            display: table;
            box-sizing: border-box;
            clear: both;
        }
        .cc_TotalContainerClose {
            text-align: center;
            position: absolute;
            display: inline-block;
            right: -15px;
            top: -15px;
            background-color: #662f8e;
            float: right;
            color: #fff;
            font-size: 30px;
            font-weight: 600;
            border-radius: 50%;
            height: 34px;
            width: 34px;
            cursor: pointer;
        }
        @media (max-width: 767.98px) {
            .cc_InnerContainerArea {
                height: 100vh;
            }
            .cc_TotalContainerClose {
                top:0;
                right:0;
            }
        }
        @media (min-width: 768px) {
            .cc_InnerContainerArea {
                width: 750px;
                height: 100vh;
            }
            .cc_TotalContainerClose {
                top:0;
                right:0;
            }
        }
        @media (min-width: 992px) {
            .cc_InnerContainerArea {
                width: 970px;
                height: 80vh;
            }
            .cc_TotalContainerClose {
                top:0;
                right:0;
            }
        }
        @media (min-width: 1200px) {
            .cc_InnerContainerArea {
                width: 1170px;
                height: 80vh;
            }
        }
        @media (min-width: 1400px) {
            .cc_InnerContainerArea {
                width: 1290px;
                height: 80vh;
            }
        }
    `));
    containerElement.appendChild(customStyleSheet);

    modalContentDivElement.appendChild(modalCloseSpanElement);
    modalDivElement.appendChild(modalContentDivElement);
    containerElement.appendChild(modalDivElement);
}

function createWidget(widgetUrl) {
    let widgetIframe = document.createElement('iframe');
    widgetIframe.frameBorder = 0;
    widgetIframe.width = "100%";
    widgetIframe.height = "100%";
    //widgetIframe.id = WIDGET_ID;
    widgetIframe.setAttribute("src", widgetUrl);

    let containerElement = document.getElementById(`modal-content-${WIDGET_ID}`);
    containerElement.appendChild(widgetIframe);
}

function removeWidget() {
    document.getElementById(WIDGET_ID).remove();
}