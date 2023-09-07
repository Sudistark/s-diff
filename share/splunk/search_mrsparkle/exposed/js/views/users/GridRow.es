/**
 * Represents a row in the table. The row contains links to perform
 * operations on the given index. The user can expand the row to see more details about the index
 */
import _ from 'underscore';
import BaseView from 'views/Base';
import DropDownMenu from 'views/shared/DropDownMenu';
import SplunkUtil from 'splunk.util';
import route from 'uri/route';
import timeUtil from 'util/time';
import { some } from 'lodash';
import LockoutCellView from './LockoutCell';

export default BaseView.extend({
    moduleId: module.id,
    tagName: 'tr',
    className: 'list-item',

    initialize(...args) {
        BaseView.prototype.initialize.apply(this, args);
        this.children.lockoutCell = new LockoutCellView({
            model: this.model,
        });
    },

    events: {
        'click .entity-edit-link': function editClickHandler(e) {
            e.preventDefault();
            this.handleActionClick('edit');
        },
    },

    canPreview() {
        const roles = this.model.entity.entry.content.get('roles');
        const canSee = some(roles, (role) => {
            const roleObj = this.collection.roles.findByEntryName(role);
            return (roleObj && (roleObj.entry.content.get('srchIndexesAllowed').length ||
                roleObj.entry.content.get('imported_srchIndexesAllowed').length));
        });
        return !!canSee;
    },

    handleActionClick(item) {
        switch (item) {
            case 'edit':
                this.model.controller.trigger('editEntity', this.model.entity);
                break;
            case 'clone':
                this.model.controller.trigger('cloneEntity', this.model.entity);
                break;
            case 'preview':
                this.openPreviewSearchPage();
                break;
            case 'delete':
                this.model.controller.trigger('deleteEntity', this.model.entity);
                break;
            case 'unlock':
                this.model.entity.entry.content.set('locked-out', false);
                this.model.entity.save(null, {
                    success: () => {
                        this.$('.cell-lockout').remove();
                    },
                });
                break;
            case 'view':
                window.location.href = SplunkUtil.make_url(`manager/${this.model.application.get('app')}` +
                    `/auth/view_capabilities?users=${encodeURIComponent(this.model.entity.entry.get('name'))}`);
                break;
            case 'viewIndexes':
                window.location.href = SplunkUtil.make_url(`manager/${this.model.application.get('app')}` +
                    `/auth/view_indexes?entity=${encodeURIComponent(this.model.entity.entry.get('name'))}&` +
                    'entityType=users');
                break;
            default:
                break;
        }
    },

    openPreviewSearchPage() {
        const roles = this.model.entity.entry.content.get('roles');
        let indexes = [];
        let srchFilter = '';
        roles.forEach((role) => {
            const roleObj = this.collection.roles.findByEntryName(role);
            if (roleObj) {
                if (roleObj.entry.content.get('srchIndexesAllowed').length) {
                    indexes.push(...roleObj.entry.content.get('srchIndexesAllowed'));
                }
                if (roleObj.entry.content.get('srchIndexesDefault').length) {
                    indexes.push(...roleObj.entry.content.get('srchIndexesDefault'));
                }
                if (roleObj.entry.content.get('imported_srchIndexesDefault').length) {
                    indexes.push(...roleObj.entry.content.get('imported_srchIndexesDefault'));
                }
                if (roleObj.entry.content.get('imported_srchIndexesAllowed').length) {
                    indexes.push(...roleObj.entry.content.get('imported_srchIndexesAllowed'));
                }
                srchFilter += roleObj.entry.content.get('srchFilter').length ?
                    `${roleObj.entry.content.get('srchFilter')} OR ` : '';
                srchFilter += roleObj.entry.content.get('imported_srchFilter').length ?
                    `${roleObj.entry.content.get('imported_srchFilter')} OR ` : '';
            }
        });

        srchFilter = srchFilter.endsWith(' OR ') ?
            srchFilter.substring(0, srchFilter.length - 4) : srchFilter;
        indexes = new Set([...indexes]);
        this.previewSearchFilterStr = '';

        indexes.forEach((index) => {
            this.previewSearchFilterStr += `index=${index} OR `;
        });
        this.previewSearchFilterStr = this.previewSearchFilterStr.endsWith(' OR ') ?
            this.previewSearchFilterStr.substring(0, this.previewSearchFilterStr.length - 4) :
            this.previewSearchFilterStr;
        this.previewSearchFilterStr += srchFilter.length ? ` | search ${srchFilter}` : '';
        const routeString = route.search(
            this.model.application.get('root'),
            this.model.application.get('locale'),
            this.model.application.get('app'),
            {
                data: {
                    earliest: '-60s',
                    latest: 'now',
                    q: this.previewSearchFilterStr,
                },
            });
        if (this.previewSearchFilterStr) {
            window.open(routeString, '_blank');
        }
    },

    render() {
        const rolesText = (this.model.entity.entry.content.get('roles') || []).map(
            role => _(role).t()).join(', ');
        const canSeeActions = this.model.entity.entry.content.get('type') === 'Splunk';
        const canDeleteUser = this.model.entity.entry.links.has('remove');
        const items = [
            { label: _('Edit').t(), value: 'edit' },
            { label: _('Clone').t(), value: 'clone' },
            { label: _('View Capabilities').t(), value: 'view' },
            { label: _('View Indexes').t(), value: 'viewIndexes' }];

        if (this.canPreview()) {
            items.push({ label: _('Search As').t(), value: 'preview' });
        }

        if (canDeleteUser) {
            items.push({ label: _('Delete').t(), value: 'delete' });
        }

        if (this.model.entity.entry.content.get('locked-out')) {
            items.push({ label: _('Unlock').t(), value: 'unlock' });
        }

        this.children.actionDropDown = new DropDownMenu({
            label: _('Edit').t(),
            className: 'btn-group',
            anchorClassName: '',
            dropdownClassName: 'dropdown-menu-narrow user-actions',
            items,
        });
        const html = this.compiledTemplate({
            model: this.model.entity,
            rolesText,
            lastLoginTime: timeUtil.convertToLocalTime(
                this.model.entity.entry.content.get('last_successful_login')),
        });

        this.$el.html(html);

        if (canSeeActions) {
            this.children.actionDropDown.render().appendTo(this.$('.cell-actions'));
            this.listenTo(this.children.actionDropDown, 'itemClicked', this.handleActionClick);
        }
        this.children.lockoutCell.render().appendTo(this.$('.cell-lockout'));

        return this;
    },
    template: `<td class='cell-name'>
                <a href=''#' class='model-title entity-edit-link'><%- model.entry.get('name') %></a>
            </td>
            <td class='cell-actions'></td>
            <td class='cell-type'><%- _(model.entry.content.get('type') || '').t() %></td>
            <td class='cell-realname'><%- model.entry.content.get('realname') %></td>
            <td class='cell-email'><%- model.entry.content.get('email') %></td>
            <td class='cell-tz'><%- _(model.entry.content.get('tz') || '').t() %></td>
            <td class='cell-defaultApp'><%- _(model.entry.content.get('defaultApp') || '').t() %></td>
            <td class='cell-defaultAppSourceRole'>
                <%- _(model.entry.content.get('defaultAppSourceRole') || '').t() %>
            </td>
            <td class='cell-roles'><%- rolesText %></td>
            <td class='cell-lastlogin'><%- lastLoginTime %></td>
            <td class='cell-lockout'></div>
            `,

}, {
    columns: [
        {
            id: 'name',
            title: _('Name').t(),
        }, {
            id: 'type',
            title: _('Authentication system').t(),
        }, {
            id: 'realname',
            title: _('Full name').t(),
        }, {
            id: 'email',
            title: _('Email address').t(),
        }, {
            id: 'tz',
            title: _('Time zone').t(),
        }, {
            id: 'defaultApp',
            title: _('Default app').t(),
        }, {
            id: 'defaultAppSourceRole',
            title: _('Default app inherited from').t(),
        }, {
            id: 'roles',
            title: _('Roles').t(),
        },
        {
            id: 'last-login',
            title: _('Last Login').t(),
        },
        {
            id: 'locked-out',
            title: _('Status').t(),
            tooltip: _('User lockout occurs per search head. See documentation for more details.').t(),
        },
    ],
});

