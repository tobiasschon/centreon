jQuery(function () {
    /* Initialize template */
    var pluginPackTemplate;
    var paginationLimit = 20;

    /**
     * Resize the list container
     * @returns {undefined}
     */
    function resizePluginPackBlock() {
        var $pluginpackBlock = jQuery('.pluginpack-block');
        var pluginpackBlockHeight = jQuery('body').height() - 40; // 40 means the height of the breadcrumb

        $pluginpackBlock.height(pluginpackBlockHeight);

        /* Fix for IE */
        if (navigator.userAgent.match(/Trident/)) {
            $pluginpackBlock.find('.pluginpack-list').width($pluginpackBlock.width() - 30);
        }
    }

    jQuery(window).on('resize', resizePluginPackBlock);
    resizePluginPackBlock();

    /**
     * Function for loading a pluginpack list with pagination
     * @returns {undefined}
     */
    function loadInstalledPluginPack() {

        /* Build data */
        var sUrl = './api/internal.php?object=centreon_pp_manager_pluginpack&action=ListInstalledOrdered&locale=' + locale;

        if (status != '' && status != 'all') {
            sUrl += '&status=' + status;
        }
        if (category != '') {
            sUrl += '&category=' + category;
        }
        if (name != '') {
            sUrl += '&name=' + name;
        }
        if (lastUpdate != '') {
            sUrl += '&lastUpdate=' + lastUpdate;
        }

        jQuery.ajax({
            url: sUrl,
            type: "get",
            dataType: "json",
            success: function (data) {
                jQuery.each(data.data, function (idx, values) {
                    /* Insert with template */
                    var line = pluginPackTemplate(values);
                    jQuery('#pluginpack-list').append(jQuery(line));
                });
                //if not ordered by date load uninstalled pp
                loadPluginPack();
            },
            complete: function(jqXHR, textStatus) {
                switch (jqXHR.status) {
                    case 200:
                        break;
                    default:
                        jQuery('#loading-pp-message').hide();
                        jQuery('#no-item-message').show();
                }
            }
        });
    }

    /**
     * Function for loading a pluginpack list with pagination
     * @returns {undefined}
     */
    function loadPluginPack() {
        /* Build data */
        var sUrl = './api/internal.php?object=centreon_pp_manager_pluginpack&action=list&limit=' +
            paginationLimit + '&offset=0&locale=' + locale;

        if (status != '' && status != 'all') {
            sUrl += '&status=' + status;
        }
        if (category != '') {
            sUrl += '&category=' + category;
        }
        if (name != '') {
            sUrl += '&name=' + name;
        }
        if (lastUpdate != '') {
            sUrl += '&lastUpdate=' + lastUpdate;
        }

        jQuery('#pluginpack-list').centreonInfiniteScroll({
            ajaxUrlGetScroll: sUrl,
            template: pluginPackTemplate,
            limit: paginationLimit,
            noItemMessage: jQuery('#no-item-message'),
            initLoadingMessage: jQuery('#loading-pp-message')
        });
    }

    /**
     * Function for loading a pluginpack list with pagination
     * @returns {undefined}
     */
    function loadPluginPackByDate() {
        /* Build data */
        var sUrl = './api/internal.php?object=centreon_pp_manager_pluginpack&action=listDated&limit=' +
            paginationLimit + '&offset=0&locale=' + locale;

        jQuery('#pluginpack-list').centreonInfiniteScroll({
            ajaxUrlGetScroll: sUrl,
            template: pluginPackTemplate,
            limit: paginationLimit,
            noItemMessage: jQuery('#no-item-message'),
            initLoadingMessage: jQuery('#loading-pp-message')
        });
    }

    /**
     * Function to update plugin pack icon with installed style
     * @param {jQuery Object} selectedPluginPackEntry
     * @returns {undefined}
     */
    function setInstalledStyleToPluginPack(selectedPluginPackEntry, ppInfo) {

        selectedPluginPackEntry.attr('data-installed', true);
        selectedPluginPackEntry.attr('data-uptodate', true);
        selectedPluginPackEntry.attr('data-complete', true);

        var installSpan = selectedPluginPackEntry.find('.install-pluginpack');
        var updateSpan = selectedPluginPackEntry.find('.update-pluginpack');

        selectedPluginPackEntry
            .addClass('pp-installed')
            .removeClass('pp-toUpdate')
            .removeClass('pp-complete')
            .attr('data-installed-version', ppInfo.version);

        if (ppInfo.unmanagedObjects.length == 0) {

            selectedPluginPackEntry
                .addClass('pp-complete');

            var reinstallBt = '<div class="icon-wrapper reinstall-pluginpack">' +
                '<span class="actionbar-icon"><img src="./img/icons/reinstall-complete.png" alt="complete" class="ico-14"></span>' +
                '</div>';

            var ico = '<div class="pp-icon-installed"><img src="./img/icons/checked.png" alt="installed"></div>';

        } else {

            selectedPluginPackEntry.attr('data-complete', false);

            var reinstallBt = '<div class="icon-wrapper reinstall-pluginpack">' +
                '<span class="actionbar-icon"><img src="./img/icons/reinstall-incomplete.png" alt="incomplete" class="ico-14"></span>' +
                '</div>';

            var ico = '<div class="pp-icon-installed"><img src="./img/icons/reinstall.png" alt="incomplete"></div>';
        }

        installSpan
            .addClass('remove-pluginpack')
            .removeClass('install-pluginpack');
        installSpan.find('img').attr('src', './img/icons/cross.png');

        selectedPluginPackEntry.find('div.pp-icon-installed').remove();

        selectedPluginPackEntry.append(ico);

        installSpan.parent().prepend(reinstallBt);

        updateSpan.remove();

        selectedPluginPackEntry.append('<a href="./main.php?p=65099&min=1&slug=' + ppInfo['slug'] +
            '" target="_blank" title="' + ppInfo['slug'] +
            '" class="bt-pp bt-pp-doc"><img src="./img/icons/help.png" class="ico-18" /></a>');
    }

    /**
     * Function to update plugin pack icon with not installed style
     * @param {jQuery Object} selectedPluginPackEntry
     * @returns {undefined}
     */
    function setNotInstalledStyleToPluginPack(selectedPluginPackEntry) {
        selectedPluginPackEntry
            .removeClass('pp-installed')
            .removeClass('pp-complete')
            .removeClass('pp-toUpdate');

        var removeSpan = selectedPluginPackEntry.find('.remove-pluginpack');
        var updateSpan = selectedPluginPackEntry.find('.update-pluginpack');

        removeSpan.find('img').attr('src', './img/icons/add.png');
        removeSpan
            .addClass('install-pluginpack')
            .removeClass('remove-pluginpack');
        updateSpan.remove();

        selectedPluginPackEntry.find('div.reinstall-pluginpack').remove();
        selectedPluginPackEntry.find('div.pp-icon-installed').remove();

        // Mask documentation button
        selectedPluginPackEntry.find(".bt-pp-doc").remove();

        selectedPluginPackEntry.attr('data-installed', false);
        selectedPluginPackEntry.attr('data-uptodate', false);
        selectedPluginPackEntry.attr('data-complete', false);
    }

    /**
     * Function to check if a plugin pack can be removed
     * @param {jQuery Object} selectedPluginPackEntry
     * @param {type} callback
     * @returns {undefined}
     */
    function checkRemovePluginPack(selectedPluginPackEntry) {
        jQuery.ajax({
            url: './api/internal.php?object=centreon_pp_manager_pluginpack&action=checkUsed',
            type: 'POST',
            data: JSON.stringify({
                "name": selectedPluginPackEntry.data('name'),
                "slug": selectedPluginPackEntry.data('slug'),
                "version": selectedPluginPackEntry.data('installed-version'),
                "id": selectedPluginPackEntry.data('id')
            }),
            dataType: 'json',
            success: function (data) {

                var hostCount = Object.keys(data['hosts']).length;
                var hostTemplateCount = Object.keys(data['host_templates']).length;
                var serviceCount = Object.keys(data['services']).length;
                var serviceTemplateCount = Object.keys(data['service_templates']).length;

                var commandCount = 0;
                jQuery.each(data['commands'], function (index, value) {
                    commandCount += Object.keys(value).length;
                });
                if (hostCount <= 0 && hostTemplateCount <= 0 &&
                    serviceCount <= 0 && serviceTemplateCount <= 0 &&
                    commandCount <= 0) {
                    removePluginPack(selectedPluginPackEntry);
                } else {

                    var depListing = "<div class='depListing'>";

                    var alertMessage = "<b class='msg-field error'>" + usedMessageStart + "</b><br>";

                    if (hostCount > 0) {
                        depListing = "<b>" + usedMessageHost + " :</b><br>";
                        jQuery.each(data['hosts'], function (index, value) {
                            depListing += "&nbsp;&nbsp;" + index + "<br><hr>";
                            jQuery.each(value, function (index1, value1) {
                                depListing += "&nbsp;&nbsp;&nbsp;&nbsp;- " + value1 + "<br>";
                            });
                        });
                        depListing += "<br>";
                    }

                    if (hostTemplateCount > 0) {
                        depListing += "<b>" + usedMessageHostTpl + " :</b><br>";
                        jQuery.each(data['host_templates'], function (index, value) {
                            depListing += "&nbsp;&nbsp;" + index + "<br><hr>";
                            jQuery.each(value, function (index1, value1) {
                                depListing += "&nbsp;&nbsp;&nbsp;&nbsp;- " + value1 + "<br>";
                            });
                        });
                        depListing += "<br>";
                    }

                    if (serviceCount > 0) {
                        depListing += "<b>" + usedMessageService + " :</b><br>";
                        jQuery.each(data['services'], function (index, value) {
                            depListing += "&nbsp;&nbsp;" + index + "<br><hr>";
                            jQuery.each(value, function (index1, value1) {
                                depListing += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- " + value1 + "<br>";
                            });
                        });
                        depListing += "<br>";
                    }

                    if (serviceTemplateCount > 0) {
                        depListing += "<b>" + usedMessageServiceTpl + " :</b><br>";
                        jQuery.each(data['service_templates'], function (index, value) {
                            depListing += "&nbsp;&nbsp;" + index + "<br><hr>";
                            jQuery.each(value, function (index1, value1) {
                                depListing += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- " + value1 + "<br>";
                            });
                        });

                        depListing += "<br>";
                    }

                    if (commandCount > 0) {
                        var mess = "";

                        jQuery.each(data['commands'], function (index, value) {

                            // Do not display message if there is no one object
                            if (Object.keys(value).length == 0) {
                                return true;
                            }

                            var text = "";

                            if (index == 'host_templates') text = usedMessageHostTpl;
                            else if (index == 'hosts') text = usedMessageHost;
                            else if (index == 'services') text = usedMessageService;
                            else if (index == 'service_templates') text = usedMessageServiceTpl;

                            mess += "  - " + text + "<br>";

                            var commandName = "";

                            jQuery.each(value, function (index1, value1) {
                                if (commandName != index1) {
                                    mess += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- " + index1 + "<br>";
                                    commandName = index1;
                                }
                                if (jQuery.trim(value1) != "") {
                                    mess += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- " + value1 + "<br>";
                                }
                            });
                        });
                        if (mess != "") {
                            depListing += usedMessageCommand + " :<br>" + mess + "</p>";
                        }
                    }

                    jQuery("#checkRemovePluginPackViewConfirm-msg").html(alertMessage + depListing);

                    var $popin = jQuery("#checkRemovePluginPackViewConfirm");
                    jQuery($popin).css('display', 'block');
                    $popin.centreonPopin("open");
                    $popin.parent().addClass('fixedDiv pluginpack-popin');
                    jQuery(".depListing").niceScroll({
                        cursoropacitymin: 0.5,
                        railpadding: {left: 10}
                    });

                    /*Hide nicescroll*/
                    $popin.find('.close').on('click', function () {
                        jQuery(".depListing").getNiceScroll().remove();
                    });
                    jQuery('#centreonPopinOverlay').on('click', function () {
                        jQuery(".depListing").getNiceScroll().remove();
                    });
                }
            }
        });
    }

    /**
     * Function to remove a plugin pack
     * @param {type} selectedPluginPackEntry
     * @param {type} data
     * @returns {undefined}
     */
    function removePluginPack(selectedPluginPackEntry, data) {
        jQuery.ajax({
            url: './api/internal.php?object=centreon_pp_manager_pluginpack&action=remove',
            type: 'POST',
            data: JSON.stringify({
                'pluginpack': [{
                    "name": selectedPluginPackEntry.data('name'),
                    "slug": selectedPluginPackEntry.data('slug'),
                    "version": selectedPluginPackEntry.data('installed-version'),
                    "id": selectedPluginPackEntry.data('id')
                }]
            }),
            dataType: 'json',
            success: function (data) {
                setNotInstalledStyleToPluginPack(selectedPluginPackEntry);
            }
        });
    }

    /**
     * Install and/or update plugin packs
     * @param pluginPacksInfos
     */
    function installOrUpdatePluginPacks(pluginPacksInfos) {
        if (pluginPacksInfos.length <= 0) {
            return;
        }
        // do install or update in the order of the array
        jQuery.ajax({
            url: './api/internal.php?object=centreon_pp_manager_pluginpack&action=installupdate',
            type: 'POST',
            data: JSON.stringify({'pluginpack': pluginPacksInfos}),
            dataType: 'json',
            // Note : if a plugin pack install failed, execute too this code :
            success: function (data) {
                managePluginPackActionReturn(data);
            }
        });
    }

    /**
     * Install a plugin pack selected by user
     * @param {jQuery Object} selectedPluginPackEntry
     * @param data
     */
    function installPluginPack(selectedPluginPackEntry, data) {
        var iToInstall = false, iToUpgrade = false;
        var aPluginPackToInstallOrUpdate = [];

        installMsgSlugs = "";
        updateMsgSlugs = "";

        jQuery.each(data, function (key, value) {
            // Add a plugin to install or update
            if (value['status'] === 'toInstall') {
                aPluginPackToInstallOrUpdate.push({
                    'slug': value['slug'],
                    'version': value['version'],
                    'action': 'install'
                });
                installMsgSlugs += " + " + value['slug'] + "<br>";
                iToInstall = true;
            } else if (value['status'] === 'toUpgrade') {
                aPluginPackToInstallOrUpdate.push({
                    'slug': value['slug'],
                    'version': value['version'],
                    'action': 'update'
                });
                updateMsgSlugs += " + " + value['slug'] + "<br>";
                iToUpgrade = true;
            }
        });

        jQuery("#plugin-to-install-message-slugs").html(installMsgSlugs);
        jQuery("#plugin-to-upgrade-message-slugs").html(updateMsgSlugs);

        jQuery("#plugin-to-install-message").toggle(iToInstall);

        jQuery("#plugin-to-upgrade-message").toggle(iToUpgrade);

        // Have dependencies to install or update
        if (aPluginPackToInstallOrUpdate.length > 1) {

            // Set name of plugin pack (in part of pop-in)
            jQuery("#pp-name-in-check-dependency").html(selectedPluginPackEntry.data('name'));

            var $popin = jQuery("#checkDependencyPPViewConfirm");
            jQuery($popin).css('display', 'block');
            $popin.centreonPopin("open");
            $popin.parent().addClass('fixedDiv pluginpack-popin');

            $popin.find('button.bt_success').off();
            $popin.find('button.bt_success').on('click', function () {
                $popin.centreonPopin("close");

                // Install and/or update PP
                installOrUpdatePluginPacks(aPluginPackToInstallOrUpdate);
            });
        } else {
            // Install and/or update PP
            installOrUpdatePluginPacks(aPluginPackToInstallOrUpdate);
        }

    }

    /**
     *
     * @param selectedPluginPackEntry
     */
    function reinstallPluginPack(selectedPluginPackEntry) {
        // do install and update in the order of the array
        jQuery.ajax({
            url: './api/internal.php?object=centreon_pp_manager_pluginpack&action=reinstall',
            type: 'POST',
            data: JSON.stringify({
                'pluginpack': [
                    {
                        'slug': selectedPluginPackEntry.data('slug'),
                        'version': selectedPluginPackEntry.data('installed-version'),
                        'action': 'update'
                    }
                ]
            }),
            dataType: 'json',
            // Note : if a plugin pack install failed, execute too this code :
            success: function (data) {
                managePluginPackActionReturn(data);
            }
        });
    }

    /**
     *
     * @param data
     */
    function managePluginPackActionReturn(data) {
        data.installed = (typeof(data.installed) != 'undefined') ? data.installed : [];
        data.updated = (typeof(data.updated) != 'undefined') ? data.updated : [];
        data.failed = (typeof(data.failed) != 'undefined') ? data.failed : [];

        jQuery.each(data.installed.concat(data.updated), function (key, value) {
            jQuery.each(jQuery(".pluginpack-entry"), function (key1, value1) {
                var selectedPluginPack = jQuery(value1);
                if (value['slug'] == selectedPluginPack.data('slug')) {

                    if (typeof(value['unmanagedObjects']) != 'undefined' && value['unmanagedObjects'].length > 0) {
                        var unmanagedObjects = value['unmanagedObjects'];

                        var msg = `<div id="modal" class="popup">
                          <div class="popup-content">
                              <div class="popup-header blue">
                                  <h3 class="popup-header-title icon-title icon-info"> The installation of the pack is complete</h3>
                              </div>
                              <div class="popup-body">
                                  <p>However owever some optional elements have not been installed:<p>
                                  <ul class="message-status bold-message">
                                      <li>${unmanagedObjects}</li>
                                  </ul>
                                  <p class="message-status">
                                      You can now deploy your monitoring.
                                  </p>
                                  <br>
                                  <p class="message-status">
                                      To install all items, you must <a class="bold-message" href="https://documentation.centreon.com/docs/centreon/en/latest/upgrade/from_packages.html#updating-the-centreon-solution" target="_blank">update your Centreon platform</a> to the latest version of all component.
                                  </p>
                                  <button class="mui-btn mui-btn--primary green closeBtn">OK</button>
                              </div>
                          </div>
                        </div>`;

                        // Set text in popin
                        var $popin = jQuery("#uninstalledObjects");
                        $popin.html(msg);

                        jQuery($popin).css('display', 'block');
                        $popin.centreonPopin("open");
                        $popin.parent().addClass('fixedDiv pluginpack-popin');

                        $popin.find('closeBtn').on('click', function () {
                            $popin.centreonPopin("close");
                        });
                    }

                    // Display the plugin pack as installed
                    setInstalledStyleToPluginPack(selectedPluginPack, value);
                }
            });
        });

        // display an error message when a installation of a plugin pack has failed
        if (data.failed.problematic !== undefined) {
            //Note : this text is not translated
            failedActionMessage("installing", data.failed);
        }
    }

    /**
     * Update a plugin pack selected by user
     * @param {jQuery Object} selectedPluginPackEntry
     * @param data
     */
    function updatePluginPack(selectedPluginPackEntry, data) {
        var iToInstall = false, iToUpgrade = false;
        var aPluginPackToInstallOrUpdate = [];

        installMsgSlugs = "";
        updateMsgSlugs = "";

        jQuery.each(data, function (key, value) {
            // Add a plugin to install or update
            if (value['status'] === 'toInstall') {
                aPluginPackToInstallOrUpdate.push({
                    'slug': value['slug'],
                    'version': value['version'],
                    'action': 'install'
                });
                installMsgSlugs += " + " + value['slug'] + "<br>";
                iToInstall = true;
            } else if (value['status'] === 'toUpgrade') {
                aPluginPackToInstallOrUpdate.push({
                    'slug': value['slug'],
                    'version': value['version'],
                    'action': 'update'
                });
                updateMsgSlugs += " + " + value['slug'] + "<br>";
                iToUpgrade = true;
            }
        });

        jQuery("#plugin-to-install-message-slugs").html(installMsgSlugs);
        jQuery("#plugin-to-upgrade-message-slugs").html(updateMsgSlugs);

        jQuery("#plugin-to-install-message").toggle(iToInstall);

        jQuery("#plugin-to-upgrade-message").toggle(iToUpgrade);

        // Have dependencies to install or update
        if (aPluginPackToInstallOrUpdate.length > 1) {

            // Set name of plugin pack (in part of pop-in)
            jQuery("#pp-name-in-check-dependency").html(selectedPluginPackEntry.data('name'));

            var $popin = jQuery("#checkDependencyPPViewConfirm");
            jQuery($popin).css('display', 'block');
            $popin.centreonPopin("open");
            $popin.parent().addClass('fixedDiv pluginpack-popin');

            $popin.find('button.bt_success').off();
            $popin.find('button.bt_success').on('click', function () {
                $popin.centreonPopin("close");

                // Install and/or update PP
                installOrUpdatePluginPacks(aPluginPackToInstallOrUpdate);
            });
        } else {
            // Install and/or update PP
            installOrUpdatePluginPacks(aPluginPackToInstallOrUpdate);
        }
    }

    /**
     *
     * @param {jQuery Object} selectedPluginPackEntry
     * @param callback
     */
    function checkDependency(selectedPluginPackEntry, callback) {
        jQuery.ajax({
            url: './api/internal.php?object=centreon_pp_manager_pluginpack&action=checkDependency',
            type: 'POST',
            data: JSON.stringify({
                "name": selectedPluginPackEntry.data('name'),
                "slug": selectedPluginPackEntry.data('slug'),
                "version": selectedPluginPackEntry.data('available-version'),
                "id": selectedPluginPackEntry.data('id')
            }),
            dataType: 'json',
            success: function (data) {
                callback(selectedPluginPackEntry, data);
            },
            error: function (err) {

                if (err.responseText) {

                    var errorTxt = err.responseText.replace(/\"/g, "");

                    var msg = "<b class='msg-field.error'>" + errorTxt + "</b>";

                    // Set text in popin
                    var $popin = jQuery("#errorIncheckDependency");
                    $popin.find("p").html(msg);

                    jQuery($popin).css('display', 'block');
                    $popin.centreonPopin("open");
                    $popin.parent().addClass('fixedDiv pluginpack-popin');
                }
            }
        });
    }

    /**
     * Display error message when an operation has failed
     * @param {string} failedAction
     * @param {array} failedDatas
     * @returns {undefined}
     */
    function failedActionMessage(failedAction, failedDatas) {
        finalMessage = "An error occured while " + failedAction + " the following plugin pack :";
        finalMessage += "<br> + " + failedDatas.problematic.slug;

        if (failedDatas.remaining.length > 0) {
            finalMessage += "<br><br>So the following plugin pack were not processed";
            jQuery.each(failedDatas.remaining, function (key, value) {
                finalMessage += "<br> + " + value['slug'];
            });
        }

        // Set text in popin
        var $popin = jQuery("#failedActionMessage");
        $popin.find("p").html(finalMessage);

        jQuery($popin).css('display', 'block');
        $popin.centreonPopin("open");
        $popin.parent().addClass('fixedDiv pluginpack-popin');

        // unique button : button OK
        $popin.find('button.bt_success').on('click', function (e) {
            $popin.centreonPopin("close");
        });
    }

    /* Display modal if instance fingerprint has been updated */
    jQuery("#updatedInstanceModal").centreonPopin({
        isModal: true,
        open: true
    });
    jQuery("#updatedInstanceModal .bt_success").on("click", function() {
        jQuery("#updatedInstanceModal").centreonPopin("close");
    });

    /* Configure NProgress */
    NProgress.configure({
        parent: '#progress-container',
        showSpinner: false
    });

    jQuery('.legend-header').toggleClick( function() {
        jQuery('.legend').css('width','218px');
        jQuery('.legend-wrapper').css({right: "0px"}, 600);
    }, function() {
        jQuery('.legend-wrapper').css({right: "-196px"}, 600, function() {
            jQuery('.legend').css('width','30px');
        });
    })

    jQuery(document).ajaxStop(function () {
        jQuery('#pluginpack-container-list').niceScroll({
            cursoropacitymin: 0.5
        }).resize();
    });

    //filter style
    jQuery('#lastUpdate').change(function() {
        if (this.checked) {
            jQuery('#category').val('');
            jQuery('#category').prop('disabled', true);
            jQuery('#name').val('');
            jQuery('#name').prop('disabled', true);
            jQuery('#status').val('all');
            jQuery('#status').prop('disabled', true);

            jQuery('.ajaxOption tr:nth-child(2) td:nth-child(1) h4').css({color: "#a7a9ac "});
            jQuery('.ajaxOption tr:nth-child(2) td:nth-child(2) h4').css({color: "#a7a9ac "});
            jQuery('.ajaxOption tr:nth-child(2) td:nth-child(3) h4').css({color: "#a7a9ac "});
        } else {
            jQuery('#category').prop('disabled', false);
            jQuery('#name').prop('disabled', false);
            jQuery('#status').prop('disabled', false);

            jQuery('.ajaxOption tr:nth-child(2) td:nth-child(1) h4').css({color: "#007f77 "});
            jQuery('.ajaxOption tr:nth-child(2) td:nth-child(2) h4').css({color: "#007f77 "});
            jQuery('.ajaxOption tr:nth-child(2) td:nth-child(3) h4').css({color: "#007f77 "});
        }
    });

    /* Call the list of pluginpack */
    if (lastUpdate == 1) {
        /* Get template file */
        jQuery.ajax({
            url: './modules/centreon-pp-manager/static/tpl/pluginpack.hbs',
            type: 'GET',
            dataType: 'text',
            success: function (data) {
                pluginPackTemplate = Handlebars.compile(data);
                loadPluginPackByDate();
            }
        });
        jQuery('#lastUpdate').prop('checked', true);

        jQuery('#category').val('');
        jQuery('#name').val('');
        jQuery('#status').val('all');

        jQuery('#category').prop('disabled', true);
        jQuery('#name').prop('disabled', true);
        jQuery('#status').prop('disabled', true);

        jQuery('.ajaxOption tr:nth-child(2) td:nth-child(1) h4').css({color: "#a7a9ac "});
        jQuery('.ajaxOption tr:nth-child(2) td:nth-child(2) h4').css({color: "#a7a9ac "});
        jQuery('.ajaxOption tr:nth-child(2) td:nth-child(3) h4').css({color: "#a7a9ac "});

    } else {
        /* Get template file */
        jQuery.ajax({
            url: './modules/centreon-pp-manager/static/tpl/pluginpack.hbs',
            type: 'GET',
            dataType: 'text',
            success: function (data) {
                pluginPackTemplate = Handlebars.compile(data);
                loadInstalledPluginPack();
            }
        });

        jQuery('#name').val(name);
        jQuery('#category').val(category);
        jQuery('#status').val(status);
    }

    /* Event on hover the installed block */
    jQuery(document).on('mouseenter', '.pluginpack-entry.pp-can-be-installed', function (e) {
        var $elem = jQuery(e.currentTarget);
        $elem.find('.actionbar').css({
            'right': '0px',
            'box-shadow': '-2px -2px 8px -1px rgba(0,0, 0, 0.3)'
        })
    });

    jQuery(document).on('mouseleave', '.pluginpack-entry.pp-can-be-installed', function (e) {
        var $elem = jQuery(e.currentTarget);
        $elem.find('.actionbar').css({
            'right': '-30px',
            'box-shadow': 'none'
        });
    });

    jQuery(document).on('click', '.showDetail', function (e) {
        loadDetail(1);
    });


    jQuery(document).on('click', '.pluginpack-entry', function (e) {
        e.stopPropagation();
        var $pluginPackEntry = jQuery(e.currentTarget);

        jQuery('.pp-details-wrapper').hide();
        jQuery('#pp-name').html($pluginPackEntry.data('name'));
        jQuery('#pp-name').addClass('pp-title');
        jQuery('#pp-name').attr('title', $pluginPackEntry.data('name'));

        var installedVersion = $pluginPackEntry.data('installed-version');
        var availableVersion = $pluginPackEntry.data('available-version');
        if (installedVersion) {
            jQuery('#pp-installed-version').text($pluginPackEntry.data('installed-version'));
            jQuery('#pp-installed-status').text($pluginPackEntry.data('label-status'));
            jQuery('#pp-detail-versioning-installed').show();
        } else {
            jQuery('#pp-detail-versioning-installed').hide();
        }

        if (!installedVersion || (installedVersion != availableVersion)) {
            jQuery('#pp-available-version').text($pluginPackEntry.data('available-version'));
            jQuery('#pp-available-status').text($pluginPackEntry.data('label-status'));
            jQuery('#pp-detail-versioning-available').show();
        } else {
            jQuery('#pp-detail-versioning-available').hide();
        }

        // Insert PP Description (in markdown)
        jQuery('#pp-description').html(
            marked($pluginPackEntry.data('description'))
        );

        jQuery('#pp-logo').css('background-image', $pluginPackEntry.find('.pp-icon').css('background-image'));


        var $ppDetailContainer = jQuery("#pp-detail");
        $ppDetailContainer.attr('data-name', $pluginPackEntry.data('name'));
        $ppDetailContainer.attr('data-slug', $pluginPackEntry.data('slug'));
        $ppDetailContainer.attr('data-installed-version', $pluginPackEntry.data('installed-version'));
        $ppDetailContainer.attr('data-available-version', $pluginPackEntry.data('available-version'));
        $ppDetailContainer.attr('data-release-date', $pluginPackEntry.data('update_date'));

        jQuery('#pp-detail-action-bar').empty();

        if ($pluginPackEntry.data('can_be_installed')) {

            if ($pluginPackEntry.data('installed') === false) {
                jQuery('#pp-detail-action-bar').append('<span class="border-radius icon-bloc install-pluginpack">' +
                    '<img src="./img/icons/add.png" alt="install" /></span>');
            } else {
                jQuery('#pp-detail-action-bar').append('<span class="border-radius icon-bloc remove-pluginpack">' +
                    '<img src="./img/icons/cross.png" alt="remove" /></span>');
                if ($pluginPackEntry.data('uptodate') === false) {
                    jQuery('#pp-detail-action-bar').append('<span class="border-radius icon-bloc update-pluginpack">' +
                        '<img src="./img/icons/up_arrow.png" alt="upload" /></span>');
                }
                if ($pluginPackEntry.data('complete') === true) {
                    jQuery('#pp-detail-action-bar').append('<span class="border-radius icon-bloc reinstall-pluginpack">' +
                        '<img src="./img/icons/reinstall-complete.png" alt="reinstall" /></span>');
                } else {
                    jQuery('#pp-detail-action-bar').append('<span class="border-radius icon-bloc reinstall-pluginpack">' +
                        '<img src="./img/icons/reinstall-incomplete.png" alt="reinstall incomplete" /></span>');
                }
            }
        } else {
            jQuery('.pp-details-wrapper').show();
        }

        var $popin = jQuery("#pluginpack-detail");
        jQuery($popin).css('display', 'block');
        $popin.centreonPopin("open");
        $popin.parent().addClass('fixedDiv pluginpack-popin');
    });

    jQuery(document).on('click', '.bt-pp-doc', function (e) {
        e.stopPropagation();
    });

    jQuery(document).on('click', '.install-pluginpack', function (e) {
        e.stopPropagation();

        // Close the other pop-in before display the pop-in
        var $popinDetailPP = jQuery("#pluginpack-detail");
        $popinDetailPP.centreonPopin("close");

        var $pluginPackEntry2 = jQuery(e.currentTarget).parent().parent();

        // Rewrite
        $pluginPackEntry2 = jQuery('.pluginpack-entry[data-slug="' + $pluginPackEntry2.data('slug') + '"]');

        checkDependency($pluginPackEntry2, installPluginPack);
    });

    jQuery(document).on('click', '.reinstall-pluginpack', function (e) {
        e.stopPropagation();

        // Close the other pop-in before display the pop-in
        var $popinDetailPP = jQuery("#pluginpack-detail");
        $popinDetailPP.centreonPopin("close");

        var $pluginPackEntry2 = jQuery(e.currentTarget).parent().parent();

        // Rewrite
        $pluginPackEntry2 = jQuery('.pluginpack-entry[data-slug="' + $pluginPackEntry2.data('slug') + '"]');

        reinstallPluginPack($pluginPackEntry2);
    });

    jQuery(document).on('click', '.update-pluginpack', function (e) {
        e.stopPropagation();

        // Close the other pop-in before display the pop-in
        var $popinDetailPP = jQuery("#pluginpack-detail");
        $popinDetailPP.centreonPopin("close");

        var $popin = jQuery("#updatePPViewConfirm");
        jQuery($popin).css('display', 'block');
        $popin.centreonPopin("open");
        $popin.parent().addClass('fixedDiv pluginpack-popin');

        var $pluginPackEntry2 = jQuery(e.currentTarget).parent().parent();

        // Rewrite
        $pluginPackEntry2 = jQuery('.pluginpack-entry[data-slug="' + $pluginPackEntry2.data('slug') + '"]');

        var updateButton = $popin.find('button.bt_info');
        updateButton.off();
        updateButton.on('click', function () {
            $popin.centreonPopin("close");

            // Update plugin pack
            checkDependency($pluginPackEntry2, updatePluginPack);
        });
    });

    jQuery(document).on('click', '.remove-pluginpack', function (e) {
        e.stopPropagation();

        // Close the other pop-in before display the pop-in
        var $popinDetailPP = jQuery("#pluginpack-detail");
        $popinDetailPP.centreonPopin("close");

        var $popin = jQuery("#removePPViewConfirm");
        jQuery($popin).css('display', 'block');
        $popin.centreonPopin("open");
        $popin.parent().addClass('fixedDiv pluginpack-popin');

        var $pluginPackEntry2 = jQuery(e.currentTarget).parent().parent();

        // Rewrite
        $pluginPackEntry2 = jQuery('.pluginpack-entry[data-slug="' + $pluginPackEntry2.data('slug') + '"]');

        $popin.find('button.bt_danger').off();
        $popin.find('button.bt_danger').on('click', function (e) {
            e.stopPropagation();
            // Remove plugin pack
            checkRemovePluginPack($pluginPackEntry2);
            $popin.centreonPopin("close");
        });
    });
});
