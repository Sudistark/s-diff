import { createTestHook } from 'util/test_support';
import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';
import Button from '@splunk/react-ui/Button';
import './WorkloadManagement.pcssm';

const HeaderSection = (props) => {
    const {
        canEditWorkloadPools,
        canEditWorkloadRules,
        handleAdmissionEnableDisableClick,
        handleEnableDisableClick,
        handlePoolUpdateModalOpen,
        handleRuleUpdateModalOpen,
        handleAdmissionModalOpen,
        tabBarState,
        isEnabled,
        isAdmissionEnabled,
        settingsView,
        getSearchPools,
        eligibleToEnable,
        eligibleToEnableAdmission,
    } = props;

    return (
        <div {...createTestHook(module.id)}>
            <div style={{ display: tabBarState === 'admission' ? 'block' : 'none' }}>
                <div style={{ width: '350px', float: 'right' }} className={'buttons-wrapper'}>
                    <Switch
                        data-test-name="ToggleAdmissionEnable"
                        style={{ float: 'right' }}
                        disabled={!eligibleToEnableAdmission}
                        selected={isAdmissionEnabled}
                        value={isAdmissionEnabled}
                        appearance="toggle"
                        onClick={handleAdmissionEnableDisableClick}
                    >
                        { isAdmissionEnabled ? _('Admission Rules Enabled').t() :
                            _('Admission Rules Disabled').t() }
                    </Switch>
                    <div>
                        { canEditWorkloadRules ?
                            <Button
                                data-test-name="AddAdmissionRule"
                                style={{ float: 'right', marginLeft: '10px' }}
                                label={_('Add Admission Rule').t()}
                                onClick={handleAdmissionModalOpen}
                            /> : null
                        }
                    </div>
                </div>
            </div>
            <div style={{ display: tabBarState === 'rules' || tabBarState === 'pools' ? 'block' : 'none' }}>
                { canEditWorkloadPools || canEditWorkloadRules ?
                    <div style={{ width: '350px', float: 'right' }} className={`buttons-wrapper ${settingsView}`}>
                        <div style={{ display: tabBarState === 'rules' ? 'block' : 'none' }}>
                            { canEditWorkloadRules ?
                                <Button
                                    data-test-name="AddWorkloadRule"
                                    style={{ float: 'right', marginLeft: '10px' }}
                                    disabled={_.isEmpty(getSearchPools)}
                                    label={_('Add Workload Rule').t()}
                                    onClick={handleRuleUpdateModalOpen}
                                /> : null
                            }
                        </div>
                        <div style={{ display: tabBarState === 'pools' ? 'block' : 'none' }}>
                            <Switch
                                data-test-name="ToggleWLMEnable"
                                style={{ float: 'right' }}
                                disabled={!eligibleToEnable}
                                selected={isEnabled}
                                value={isEnabled}
                                appearance="toggle"
                                onClick={handleEnableDisableClick}
                            >
                                { isEnabled ? _('Workload Management Enabled').t() :
                                    _('Workload Management Disabled').t() }
                            </Switch>
                            { canEditWorkloadPools ?
                                <Button
                                    data-test-name="AddWorkloadPool"
                                    style={{ float: 'right', marginLeft: '10px' }}
                                    label={_('Add Workload Pool').t()}
                                    onClick={handlePoolUpdateModalOpen}
                                /> : null
                            }
                        </div>
                    </div> : null
                }
            </div>
        </div>
    );
};

HeaderSection.propTypes = {
    canEditWorkloadPools: PropTypes.bool.isRequired,
    canEditWorkloadRules: PropTypes.bool.isRequired,
    handleAdmissionEnableDisableClick: PropTypes.func.isRequired,
    handleEnableDisableClick: PropTypes.func.isRequired,
    handlePoolUpdateModalOpen: PropTypes.func.isRequired,
    handleRuleUpdateModalOpen: PropTypes.func.isRequired,
    handleAdmissionModalOpen: PropTypes.func.isRequired,
    tabBarState: PropTypes.string.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    isAdmissionEnabled: PropTypes.bool.isRequired,
    eligibleToEnableAdmission: PropTypes.bool.isRequired,
    settingsView: PropTypes.string.isRequired,
    getSearchPools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    eligibleToEnable: PropTypes.bool.isRequired,
};

HeaderSection.defaultProps = {};

export default HeaderSection;
