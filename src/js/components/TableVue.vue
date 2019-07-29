<template>
  <md-table class="appTable"
            v-model="searched"
            md-sort="id"
            md-sort-order="asc"
            :class="{'edtion-disabled': !isDisabled}"
            md-card>
    <p style="display: none;">{{isDisabled}}</p>
    <md-table-toolbar class="md-dense main-table-header-toolbar">
      <div class="md-toolbar-row">
        <h1 class="md-title">Users Roles</h1>
        <div class="md-toolbar-section-end">
          <md-field md-clearable
                    class="field-searchbar">
            <md-input placeholder="Search by ID or name..."
                      v-model="search"
                      @input="searchOnTable" />
          </md-field>
          <md-menu class="menu-export">
            <md-button class="md-icon-button"
                       md-menu-trigger>
              <md-icon>file_download</md-icon>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="exportXLSX">
                <span>XLSX</span>
              </md-menu-item>

              <md-menu-item @click="exportCSV">
                <span>CSV</span>
              </md-menu-item>
              <md-menu-item @click="exportPDF">
                <span>PDF</span>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
          <md-button :class="{'edit-button-disabled': isDisabled}"
                     class="md-icon-button edit-button"
                     @click="$emit('onEditClick', !isDisabled)">
            <md-icon>edit</md-icon>
          </md-button>
        </div>
      </div>
    </md-table-toolbar>
    <md-table-toolbar slot=" md-dense edit-toolbar-row"
                      v-if="!isDisabled">
      <div class="md-toolbar-row">
        <h1 class="md-title">Edition Bar</h1>
        <div class="md-toolbar-section-end">
          <slot name="edition-bar-buttons"></slot>
          <md-button :class="{'edit-button-disabled': isDisabled}"
                     class="md-icon-button edit-button"
                     @click="$emit('onEditClick', !isDisabled)">
            <md-icon>edit</md-icon>
          </md-button>
        </div>
      </div>
    </md-table-toolbar>

    <md-table-empty-state md-label="No users found"
                          :md-description="`No user found for this '${search}' query. Try a different search term.`">
    </md-table-empty-state>
    <md-table-row slot="md-table-row"
                  slot-scope="{ item }">
      <md-table-cell v-if="!isDisabled"
                     md-label="Edit">
        <md-menu>
          <md-button class="md-icon-button"
                     md-menu-trigger>
            <md-icon>more_vert</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click="clickOnEdit(item)">
              <md-icon>edit</md-icon>
              <span>Edit</span>
            </md-menu-item>

            <md-menu-item @click="clickOnDelete(item)">
              <md-icon>delete</md-icon>
              <span>Delete</span>
            </md-menu-item>
        </md-menu>
      </md-table-cell>
      <md-table-cell md-label="ID"
                     md-sort-by="id"
                     md-numeric>{{ item.id }}</md-table-cell>
      <md-table-cell md-label="Name"
                     md-sort-by="name">{{ item.name }}</md-table-cell>

      <md-table-cell class="md-table-cell-center"
                     v-for="userProfile in userProfiles"
                     :key="userProfile.id"
                     :md-label="userProfile.name">
        <md-button class="appTable-table-cell-btn"
                   :disabled="isDisabled"
                   @click="onChange(!(item[userProfile.name]), userProfile.id, item)">
          <md-icon>{{getIcon(item[userProfile.name])}}</md-icon>
        </md-button>
      </md-table-cell>
    </md-table-row>
    <EditPassword :isShown="showPasswordDialog"
                  @close="showPasswordDialog = false"
                  :userEdit="userEdit"></EditPassword>
    <md-dialog-confirm :md-active.sync="showDeleteDialog"
                       md-title="Confim the Removal"
                       :md-content="`Please confirm the removal of the user <strong>${userEdit.name}</strong><br/><strong>This action is not reversible.</strong>`"
                       md-confirm-text="Comfim"
                       md-cancel-text="Cancel"
                       @md-cancel="showDeleteDialog = false"
                       @md-confirm="onConfirmDelete" />

  </md-table>

</template>

<script>
import {
  exportToXLSX,
  exportToCSV,
  exportToPDF
} from "../utils/exportSheet.js";
import EditPassword from "./EditPassword.vue";
import { spinalIO } from "../services/spinal-io";
const toLower = text => {
  return text.toString().toLowerCase();
};

const searchByIdOrName = (items, term) => {
  if (term) {
    return items.filter(item => {
      return (
        toLower(item.name).includes(toLower(term)) ||
        toLower(item.id).includes(toLower(term))
      );
    });
  }

  return items;
};

export default {
  name: "TableVue",
  props: ["users", "userProfiles", "isDisabled"],
  data() {
    return {
      search: "",
      searched: [],
      showPasswordDialog: false,
      showDeleteDialog: false,
      usersComputed: [],
      edition: false,
      userEdit: ""
    };
  },
  components: {
    EditPassword
  },
  watch: {
    users: {
      deep: true,
      handler() {
        for (let idx = 0; idx < this.users.length; idx++) {
          const element = this.users[idx];
          let usr = this.getUserComputed(element.id);
          if (usr === undefined) {
            const usr = {
              id: element.id,
              name: element.name
            };
            for (let i = 0; i < element.userProfiles.length; i++) {
              const userProfiles = element.userProfiles[i];
              usr[userProfiles.userProfile.name] = userProfiles.value;
            }
            this.usersComputed.push(usr);
          } else {
            for (let i = 0; i < element.userProfiles.length; i++) {
              const userProfiles = element.userProfiles[i];
              usr[userProfiles.userProfile.name] = userProfiles.value;
            }
          }
        }
        const toRemove = new Set();
        for (let idx = 0; idx < this.usersComputed.length; idx++) {
          const element = this.usersComputed[idx];
          let found = false;
          for (let idx2 = 0; idx2 < this.users.length; idx2++) {
            const element2 = this.users[idx2];
            if (element.id === element2.id) {
              found = true;
              break;
            }
          }
          if (found === false) {
            toRemove.add(this.usersComputed[idx]);
          }
        }
        for (const userToRemove of toRemove) {
          const idx = this.usersComputed.findIndex(
            elem => userToRemove.id === elem.id
          );
          if (idx > 0) this.usersComputed.splice(idx, 1);
        }
        this.searched = searchByIdOrName(this.usersComputed, this.search);
      }
    }
  },
  methods: {
    clickOnEdit(userEdit) {
      this.userEdit = userEdit;
      this.showPasswordDialog = true;
    },
    clickOnDelete(item) {
      this.userEdit = item;
      this.showDeleteDialog = true;
    },
    onConfirmDelete() {
      console.log(this.userEdit);
      spinalIO.deleteUserdByAdmin(this.userEdit.name);
    },
    onChange(value, key, user) {
      this.$emit("onChange", value, key, this.getUser(user.id));
    },
    getIcon(bool) {
      return bool ? "check_box" : "check_box_outline_blank";
    },
    getUser(id) {
      for (let idx = 0; idx < this.users.length; idx++) {
        const element = this.users[idx];
        if (element.id === id) return element;
      }
      return undefined;
    },
    getUserComputed(id) {
      for (let idx = 0; idx < this.usersComputed.length; idx++) {
        const element = this.usersComputed[idx];
        if (element.id === id) return element;
      }
      return undefined;
    },
    searchOnTable() {
      this.searched = searchByIdOrName(this.usersComputed, this.search);
    },
    exportData(cellFormatFunc) {
      if (!cellFormatFunc) cellFormatFunc = e => e;
      const headerRow = [cellFormatFunc("ID"), cellFormatFunc("Name")];
      for (let idx = 0; idx < this.userProfiles.length; idx++) {
        const element = this.userProfiles[idx];
        headerRow.push(cellFormatFunc(element.name));
      }
      const data = [headerRow];
      for (let idx = 0; idx < this.usersComputed.length; idx++) {
        const user = this.usersComputed[idx];
        const row = [cellFormatFunc(user.id), cellFormatFunc(user.name)];
        const usr = this.getUser(user.id);
        for (let i = 0; i < usr.userProfiles.length; i++) {
          const userProfiles = usr.userProfiles[i];
          row.push(cellFormatFunc(userProfiles.value));
        }
        data.push(row);
      }
      return data;
    },

    exportXLSX() {
      exportToXLSX("UsersRoles", this.exportData());
    },
    exportCSV() {
      exportToCSV("UsersRoles", this.exportData());
    },
    exportPDF() {
      exportToPDF("UsersRoles", this.exportData());
    }
  },
  mounted() {}
};
</script>

<style scoped>
.appTable {
  width: 100vw;
  height: inherit;
}
.appTable .center-col {
  text-align: center;
}
.appTable .md-table-cell-center {
  text-align: center;
}
.appTable .appTable-table-cell-btn {
  min-width: 70%;
  margin: 0;
}
.menu-export {
  width: 40px;
}
.field-searchbar {
  max-width: 300px;
}
.md-toolbar.md-table-toolbar:not(.main-table-header-toolbar) {
  background-color: #222 !important;
}
.md-toolbar-row .edit-button .md-icon {
  color: red;
}
.md-toolbar-row .edit-button.edit-button-disabled .md-icon {
  color: white;
}
</style>

<style>
.appTable.edtion-disabled .md-table-head:first-child,
.appTable.edtion-disabled .md-table-head:first-child .md-table-head-container {
  width: 66px;
}
.appTable.edtion-disabled
  .md-table-head:first-child
  .md-table-head-container
  .md-table-head-label {
  padding-right: 24px;
  padding-left: 19px;
}
.appTable .md-table-head-container.md-disabled {
  text-align: center;
}
.appTable.edtion-disabled .md-table-cell:first-child {
  text-align: center;
}
.appTable.edtion-disabled .md-table-cell:first-child .md-table-cell-container {
  padding: 0;
}
.appTable .md-content.md-table-content {
  max-width: 100vw;
}
</style>
