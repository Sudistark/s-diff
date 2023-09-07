import PropTypes from 'prop-types';
import React from 'react';
import UploadAppButton from 'views/managementconsole/apps/uploaded_apps/UploadAppButton';
import HeaderSection from './HeaderSection';
import PackagesTable from './PackagesTable';
import ProgressModal from './modals/ProgressModal';
import VettingErrorModal from './modals/VettingErrorModal';
import InstallSuccessModal from './modals/InstallSuccessModal';

const selectFilename = props => props.file && props.file.name;

function UploadedAppsPage(props) {
    const {
        title,
        description,
        packages,
        uploadDialogOpen,
        status,
        responseMessage,
        fileUploadPercent,
        deploymentInProgress,
        buttonLabel,
        onRequestUpload,
        onRequestOpen,
        onRequestClose,
        onAddFile,
        onRemoveFile,
        action,
        actionDialogOpen,
        actionDialogTitle,
        taskStatus,
        privateAppGlobal,
        packageId,
        packageName,
        viewReportLink,
        installSuccessModalOpen,
        appName,
        vettingProgressModalOpen,
        installProgressModalOpen,
        vettingErrorCount,
        vettingWarningCount,
        vettingErrorModalOpen,
        acknowledgementModalOpen,
        acknowledgementModalTitle,
        onAcknowledgementModalClose,
        onAcknowledgementModalOpen,
        onInstallPackageOpen,
        onInstallPackage,
        canEdit,
        onUpdatePackageOpen,
        onUpdatePackage,
        onDeletePackageOpen,
        onDeletePackage,
        onMoreInfoOpen,
        loginDialogOpen,
        consent,
        onLoginOpen,
        onLogin,
        onConsentToggle,
    } = props;

    const headerSectionProps = {
        title,
        description,
    };

    const uploadButtonProps = {
        uploadDialogOpen,
        status,
        responseMessage,
        filename: selectFilename(props),
        fileUploadPercent,
        buttonLabel,
        onRequestUpload,
        onRequestOpen,
        onRequestClose,
        onAddFile,
        onRemoveFile,
        loginDialogOpen,
        consent,
        onLoginOpen,
        onLogin,
        onConsentToggle,
    };

    const packagesTableProps = {
        packages,
        deploymentInProgress,
        action,
        actionDialogOpen,
        actionDialogTitle,
        buttonLabel,
        responseMessage,
        taskStatus,
        status,
        privateAppGlobal,
        packageId,
        vettingWarningCount,
        acknowledgementModalOpen,
        acknowledgementModalTitle,
        onAcknowledgementModalOpen,
        onAcknowledgementModalClose,
        onInstallPackageOpen,
        onInstallPackage,
        onRequestClose,
        canEdit,
        onUpdatePackageOpen,
        onUpdatePackage,
        onDeletePackageOpen,
        onDeletePackage,
        onMoreInfoOpen,
        viewReportLink,
    };

    const ProgressModalProps = {
        packageName,
        open: vettingProgressModalOpen || installProgressModalOpen,
        action: installProgressModalOpen ? 'installing' : 'vetting',
    };

    const VettingErrorModalProps = {
        handleRequestClose: onRequestClose,
        open: vettingErrorModalOpen,
        vettingErrorCount,
        viewReportLink,
    };

    const InstallSuccessModalProps = {
        open: installSuccessModalOpen,
        handleRequestClose: onRequestClose,
        appName,
    };

    return (
        <div data-test="UploadedApps-Page">
            <HeaderSection {...headerSectionProps}>
                <div className="buttons-wrapper pull-right">
                    { props.canEdit && <UploadAppButton {...uploadButtonProps} /> }
                </div>
            </HeaderSection>
            <div className="main-section">
                <PackagesTable {...packagesTableProps} />
            </div>
            <div className="progress-modal">
                <ProgressModal {...ProgressModalProps} />
            </div>
            <div className="vetting-error-modal">
                <VettingErrorModal {...VettingErrorModalProps} />
            </div>
            <div className="install-success-modal">
                <InstallSuccessModal {...InstallSuccessModalProps} />
            </div>
        </div>
    );
}

UploadedAppsPage.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    packages: PropTypes.arrayOf(PropTypes.shape({})),
    uploadDialogOpen: PropTypes.bool.isRequired,
    status: PropTypes.string,
    responseMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    fileUploadPercent: PropTypes.number,
    buttonLabel: PropTypes.string,
    deploymentInProgress: PropTypes.bool,
    onRequestUpload: PropTypes.func.isRequired,
    onRequestOpen: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onAddFile: PropTypes.func.isRequired,
    onRemoveFile: PropTypes.func.isRequired,
    appName: PropTypes.string.isRequired,
    action: PropTypes.string,
    actionDialogOpen: PropTypes.bool,
    actionDialogTitle: PropTypes.string,
    taskStatus: PropTypes.number,
    privateAppGlobal: PropTypes.bool.isRequired,
    packageId: PropTypes.string,
    packageName: PropTypes.string.isRequired,
    viewReportLink: PropTypes.string.isRequired,
    installSuccessModalOpen: PropTypes.bool.isRequired,
    vettingProgressModalOpen: PropTypes.bool.isRequired,
    installProgressModalOpen: PropTypes.bool.isRequired,
    vettingErrorCount: PropTypes.string.isRequired,
    vettingWarningCount: PropTypes.string.isRequired,
    vettingErrorModalOpen: PropTypes.bool.isRequired,
    acknowledgementModalTitle: PropTypes.string.isRequired,
    acknowledgementModalOpen: PropTypes.bool.isRequired,
    onAcknowledgementModalOpen: PropTypes.func.isRequired,
    onAcknowledgementModalClose: PropTypes.func.isRequired,
    onInstallPackage: PropTypes.func.isRequired,
    onInstallPackageOpen: PropTypes.func.isRequired,
    canEdit: PropTypes.bool,
    onUpdatePackageOpen: PropTypes.func.isRequired,
    onUpdatePackage: PropTypes.func.isRequired,
    onDeletePackageOpen: PropTypes.func.isRequired,
    onDeletePackage: PropTypes.func.isRequired,
    onMoreInfoOpen: PropTypes.func.isRequired,
    loginDialogOpen: PropTypes.bool,
    consent: PropTypes.bool,
    onLoginOpen: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onConsentToggle: PropTypes.func.isRequired,
};

UploadedAppsPage.defaultProps = {
    title: '',
    description: '',
    packages: undefined,
    status: undefined,
    responseMessage: '',
    fileUploadPercent: 0,
    statusData: undefined,
    buttonLabel: undefined,
    deploymentInProgress: false,
    action: undefined,
    packageId: '',
    actionDialogOpen: false,
    actionDialogTitle: undefined,
    taskStatus: undefined,
    canEdit: false,
    consent: false,
    loginDialogOpen: false,
};

export default UploadedAppsPage;
