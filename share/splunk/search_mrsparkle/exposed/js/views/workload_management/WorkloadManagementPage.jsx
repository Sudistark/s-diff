import { createTestHook } from 'util/test_support';
import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import HeaderSection from './HeaderSection';
import CategoryCards from './CategoryCards';
import CategoriesTable from './CategoriesTable';
import PoolsTable from './PoolsTable';
import RulesTable from './RulesTable';
import AdmissionRulesTable from './AdmissionRulesTable';
import CategoryUpdateModal from './CategoryUpdateModal';
import PoolUpdateModal from './PoolUpdateModal';
import PoolDeleteModal from './PoolDeleteModal';
import RuleUpdateModal from './RuleUpdateModal';
import RuleDeleteModal from './RuleDeleteModal';
import AdmissionRuleModal from './AdmissionRuleModal';
import PreflightChecks from './PreflightChecks';
import MessageModal from './MessageModal';
import EnableAddActions from './EnableAddActions';
import WorkloadManagementMessages from './WorkloadManagementMessages';
import css from './WorkloadManagement.pcssm';

const WorkloadManagementPage = (props) => {
    const {
        title,
        description,
        learnMore,
        isEnabled,
        isAdmissionEnabled,
        eligibleToEnableAdmission,
        enableSettingsViewBtn,
        categoryUpdateModalOpen,
        categoryUpdateModalState,
        handleCategoryUpdateModalClose,
        handleCategoryUpdateModalTextChange,
        handleCategoryUpdateModalSubmit,
        handleCategoryUpdateModalOpenEdit,
        handleCategoryClick,
        handleCategoryRowNameClick,
        categoryCardState,
        categories,
        handleReRunPreflightCheck,
        handleShowSettingsView,
        handleShowPreFlightCheckView,
        allPreflightChecksPass,
        showPreFlightCheckView,
        isPreflightCheckLoading,
        checks,
        statusErrorMessage,
        missingTablesMessage,
        getDefaultSearchPool,
        getDefaultIngestPool,
        getSearchPools,
        getIngestPools,
        getMiscPools,
        isSearchCategoryAllocated,
        isIngestCategoryAllocated,
        isMiscCategoryAllocated,
        pools,
        rules,
        admissionRules,
        canEditWorkloadPools,
        canEditWorkloadRules,
        poolUpdateModalOpen,
        poolUpdateModalState,
        handleAdmissionEnableDisableClick,
        handleEnableDisableClick,
        handlePoolUpdateModalOpen,
        handlePoolUpdateModalClose,
        handlePoolUpdateModalOpenEdit,
        handlePoolUpdateModalTextChange,
        handlePoolUpdateModalCheckbox,
        handlePoolUpdateModalSubmit,
        poolDeleteModalOpen,
        poolDeleteModalState,
        handlePoolDeleteModalOpen,
        handlePoolDeleteModalClose,
        handlePoolDeleteModalSubmit,
        ruleUpdateModalOpen,
        ruleUpdateModalState,
        handleRuleUpdateModalOpen,
        handleRuleUpdateModalClose,
        handleRuleUpdateModalOpenEdit,
        handleRuleUpdateModalTextChange,
        handleRuleUpdateModalMultiSelectChange,
        handleRuleUpdateModalSubmit,
        admissionModalOpen,
        handleAdmissionModalOpen,
        ruleDeleteModalOpen,
        ruleDeleteModalState,
        handleRuleDeleteModalOpen,
        handleRuleDeleteModalClose,
        handleRuleDeleteModalSubmit,
        messageModalState,
        handleMessageModalClose,
        handleTabBarChange,
        tabBarState,
    } = props;

    const mainSectionClassName = `workload-main-section ${css.mainSection}`;
    const isPoolTableEmpty = (pools.length === 0);
    const isRuleTableEmpty = (rules.length === 0);
    const isAdmissionRuleTableEmpty = (admissionRules.length === 0);
    const settingsView = (showPreFlightCheckView ? `${css.displayNone}` : '');
    const preFlightCheckView = (showPreFlightCheckView ? '' : `${css.displayNone}`);
    const preflightChecksFail = (allPreflightChecksPass ? `${css.displayNone}` : '');
    const eligibleToEnable = canEditWorkloadPools && !_.isEmpty(getDefaultSearchPool) &&
        !_.isEmpty(getDefaultIngestPool);

    const headerSectionProps = {
        title,
        description,
        learnMore,
        handleTabBarChange,
        tabBarState,
    };

    const categoryCardsSectionProps = {
        canEditWorkloadPools,
        handleCategoryUpdateModalOpenEdit,
        handleCategoryClick,
        categoryCardState,
        categories,
    };

    const categoryUpdateModalProps = {
        categoryUpdateModalOpen,
        categoryUpdateModalState,
        handleCategoryUpdateModalClose,
        handleCategoryUpdateModalTextChange,
        handleCategoryUpdateModalSubmit,
    };

    const categoriesTableProps = {
        categoryCardState,
        handleCategoryRowNameClick,
        categories,
        canEditWorkloadPools,
        handleCategoryUpdateModalOpenEdit,
    };

    const poolsTableProps = {
        pools,
        canEditWorkloadPools,
        handlePoolUpdateModalOpenEdit,
        handlePoolDeleteModalOpen,
        categoryCardState,
    };

    const rulesTableProps = {
        rules,
        ruleUpdateModalState,
        canEditWorkloadRules,
        handleRuleUpdateModalOpenEdit,
        handleRuleDeleteModalOpen,
    };

    const admissionRulesTableProps = {
        admissionRules,
        ruleUpdateModalState,
        canEditWorkloadRules,
        handleRuleUpdateModalOpenEdit,
        handleRuleDeleteModalOpen,
    };

    const poolUpdateModalProps = {
        poolUpdateModalOpen,
        poolUpdateModalState,
        handlePoolUpdateModalClose,
        handlePoolUpdateModalTextChange,
        handlePoolUpdateModalCheckbox,
        handlePoolUpdateModalSubmit,
    };

    const poolDeleteModalProps = {
        poolDeleteModalOpen,
        poolDeleteModalState,
        handlePoolDeleteModalClose,
        handlePoolDeleteModalSubmit,
    };

    const ruleUpdateModalProps = {
        ruleUpdateModalOpen,
        ruleUpdateModalState,
        handleRuleUpdateModalClose,
        handleRuleUpdateModalTextChange,
        handleRuleUpdateModalMultiSelectChange,
        handleRuleUpdateModalSubmit,
    };

    const admissionRuleModalProps = {
        admissionModalOpen,
        ruleUpdateModalState,
        handleRuleUpdateModalClose,
        handleRuleUpdateModalTextChange,
        handleRuleUpdateModalMultiSelectChange,
        handleRuleUpdateModalSubmit,
    };

    const ruleDeleteModalProps = {
        ruleDeleteModalOpen,
        ruleDeleteModalState,
        handleRuleDeleteModalClose,
        handleRuleDeleteModalSubmit,
    };

    const messageModalProps = {
        messageModalState,
        handleMessageModalClose,
    };

    const preflightChecksProps = {
        enableSettingsViewBtn,
        handleReRunPreflightCheck,
        handleShowSettingsView,
        isPreflightCheckLoading,
        checks,
        tabBarState,
    };

    const EnableAddActionsProps = {
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
        getSearchPools,
        settingsView,
        eligibleToEnable,
        eligibleToEnableAdmission,
    };

    const WorkloadManagementMessagesProps = {
        canEditWorkloadPools,
        canEditWorkloadRules,
        tabBarState,
        isEnabled,
        getDefaultSearchPool,
        getDefaultIngestPool,
        getSearchPools,
        getIngestPools,
        getMiscPools,
        isSearchCategoryAllocated,
        isIngestCategoryAllocated,
        isMiscCategoryAllocated,
        statusErrorMessage,
        missingTablesMessage,
        admissionRules,
    };

    return (
        <div {...createTestHook(module.id)}>
            <HeaderSection {...headerSectionProps} />
            <div className={`${mainSectionClassName}`}>
                <div className={`${settingsView}`}>
                    <div style={{ display: tabBarState === 'admission' ? 'block' : 'none' }}>
                        { !isAdmissionEnabled && eligibleToEnable ?
                            <Message type="info">{_('To activate admission rules, ' +
                                'set the switch to Enabled.').t()}</Message>
                            : null
                        }
                    </div>
                    <div style={{ display: tabBarState === 'rules' || tabBarState === 'pools' ? 'block' : 'none' }}>
                        { !isEnabled && eligibleToEnable ?
                            <Message type="info">{_('To activate workload management, ' +
                                'set the switch to Enabled.').t()}</Message>
                            : null
                        }
                    </div>
                    <div className={`${css.preFlightCheckSettingsPageMsg} ${preflightChecksFail}`}>
                        <div style={{ display: tabBarState === 'rules' || tabBarState === 'pools' ? 'block' : 'none' }}>
                            <Message type="error">
                                {_('Preflight checks failed.').t()} &nbsp;
                            </Message>
                            <Button
                                label={_('View preflight checks').t()}
                                appearance="pill"
                                onClick={handleShowPreFlightCheckView}
                                classNamePrivate={css.link}
                            />
                        </div>
                    </div>
                </div>
                <EnableAddActions {...EnableAddActionsProps} />
                <div className={`${settingsView}`}>
                    <WorkloadManagementMessages {...WorkloadManagementMessagesProps} />

                    <div style={{ display: tabBarState === 'admission' ? 'block' : 'none' }} />

                    <div style={{ display: tabBarState === 'pools' ? 'block' : 'none', clear: 'both' }}>
                        <CategoryCards {...categoryCardsSectionProps} />
                        <CategoriesTable {...categoriesTableProps} />
                        { isPoolTableEmpty ? null : <PoolsTable {...poolsTableProps} /> }
                    </div>

                    <div style={{ display: tabBarState === 'rules' ? 'block' : 'none', clear: 'both' }}>
                        { isRuleTableEmpty ? null : <RulesTable {...rulesTableProps} /> }
                    </div>

                    <CategoryUpdateModal {...categoryUpdateModalProps} />
                    <PoolUpdateModal {...poolUpdateModalProps} />
                    <PoolDeleteModal {...poolDeleteModalProps} />
                    <RuleUpdateModal {...ruleUpdateModalProps} />
                    <AdmissionRuleModal {...admissionRuleModalProps} />
                    <RuleDeleteModal {...ruleDeleteModalProps} />
                    <MessageModal {...messageModalProps} />
                </div>
                <div style={{ display: tabBarState === 'admission' ? 'block' : 'none', clear: 'both' }}>
                    { isAdmissionRuleTableEmpty ? null : <AdmissionRulesTable {...admissionRulesTableProps} /> }
                </div>
            </div>

            <div className={`${mainSectionClassName} ${preFlightCheckView}`}>
                <PreflightChecks {...preflightChecksProps} />
            </div>
        </div>
    );
};

WorkloadManagementPage.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    learnMore: PropTypes.shape({}).isRequired,
    isEnabled: PropTypes.bool.isRequired,
    isAdmissionEnabled: PropTypes.bool.isRequired,
    eligibleToEnableAdmission: PropTypes.bool.isRequired,
    enableSettingsViewBtn: PropTypes.bool.isRequired,
    categoryUpdateModalOpen: PropTypes.bool.isRequired,
    categoryUpdateModalState: PropTypes.shape({}).isRequired,
    handleCategoryUpdateModalClose: PropTypes.func.isRequired,
    handleCategoryUpdateModalTextChange: PropTypes.func.isRequired,
    handleCategoryUpdateModalSubmit: PropTypes.func.isRequired,
    handleCategoryUpdateModalOpenEdit: PropTypes.func.isRequired,
    handleCategoryClick: PropTypes.func.isRequired,
    handleCategoryRowNameClick: PropTypes.func.isRequired,
    categoryCardState: PropTypes.shape({}).isRequired,
    categories: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    handleReRunPreflightCheck: PropTypes.func.isRequired,
    handleShowSettingsView: PropTypes.func.isRequired,
    handleShowPreFlightCheckView: PropTypes.func.isRequired,
    allPreflightChecksPass: PropTypes.bool.isRequired,
    showPreFlightCheckView: PropTypes.bool.isRequired,
    isPreflightCheckLoading: PropTypes.bool.isRequired,
    checks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    statusErrorMessage: PropTypes.string.isRequired,
    missingTablesMessage: PropTypes.string.isRequired,
    getDefaultSearchPool: PropTypes.shape({}),
    getDefaultIngestPool: PropTypes.shape({}),
    getSearchPools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    getIngestPools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    getMiscPools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    isSearchCategoryAllocated: PropTypes.bool.isRequired,
    isIngestCategoryAllocated: PropTypes.bool.isRequired,
    isMiscCategoryAllocated: PropTypes.bool.isRequired,
    pools: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    rules: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    admissionRules: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    canEditWorkloadPools: PropTypes.bool.isRequired,
    canEditWorkloadRules: PropTypes.bool.isRequired,
    poolUpdateModalOpen: PropTypes.bool,
    poolUpdateModalState: PropTypes.shape({}).isRequired,
    handleAdmissionEnableDisableClick: PropTypes.func.isRequired,
    handleEnableDisableClick: PropTypes.func.isRequired,
    handlePoolUpdateModalOpen: PropTypes.func.isRequired,
    handlePoolUpdateModalClose: PropTypes.func.isRequired,
    handlePoolUpdateModalOpenEdit: PropTypes.func.isRequired,
    handlePoolUpdateModalTextChange: PropTypes.func.isRequired,
    handlePoolUpdateModalCheckbox: PropTypes.func.isRequired,
    handlePoolUpdateModalSubmit: PropTypes.func.isRequired,
    poolDeleteModalOpen: PropTypes.bool,
    poolDeleteModalState: PropTypes.shape({}).isRequired,
    handlePoolDeleteModalOpen: PropTypes.func.isRequired,
    handlePoolDeleteModalClose: PropTypes.func.isRequired,
    handlePoolDeleteModalSubmit: PropTypes.func.isRequired,
    ruleUpdateModalOpen: PropTypes.bool,
    ruleUpdateModalState: PropTypes.shape({}).isRequired,
    handleRuleUpdateModalOpen: PropTypes.func.isRequired,
    handleRuleUpdateModalClose: PropTypes.func.isRequired,
    handleRuleUpdateModalOpenEdit: PropTypes.func.isRequired,
    handleRuleUpdateModalTextChange: PropTypes.func.isRequired,
    handleRuleUpdateModalMultiSelectChange: PropTypes.func.isRequired,
    handleRuleUpdateModalSubmit: PropTypes.func.isRequired,
    ruleDeleteModalOpen: PropTypes.bool,
    ruleDeleteModalState: PropTypes.shape({}).isRequired,
    handleRuleDeleteModalOpen: PropTypes.func.isRequired,
    handleRuleDeleteModalClose: PropTypes.func.isRequired,
    handleRuleDeleteModalSubmit: PropTypes.func.isRequired,
    admissionModalOpen: PropTypes.bool,
    handleAdmissionModalOpen: PropTypes.func.isRequired,
    messageModalState: PropTypes.shape({}).isRequired,
    handleMessageModalClose: PropTypes.func.isRequired,
    handleTabBarChange: PropTypes.func.isRequired,
    tabBarState: PropTypes.string.isRequired,
};

WorkloadManagementPage.defaultProps = {
    title: '',
    description: '',
    poolUpdateModalOpen: false,
    poolDeleteModalOpen: false,
    ruleUpdateModalOpen: false,
    admissionModalOpen: false,
    ruleDeleteModalOpen: false,
    getDefaultSearchPool: {},
    getDefaultIngestPool: {},
};

export default WorkloadManagementPage;
