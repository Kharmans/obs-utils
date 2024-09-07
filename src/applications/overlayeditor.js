import OverlayEditorUI from "../svelte/OverlayEditorUI.svelte";
import { SvelteApplication } from "@typhonjs-fvtt/runtime/svelte/application";
import { getSetting, setSetting } from "../utils/settings.js";
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

export default class OverlayEditor extends SvelteApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["overlayeditor"],
      id: "overlayeditor-application",
      title: localize("obs-utils.applications.overlayEditor.name"),
      //tabs: [{ navSelector: '.tabs', contentSelector: '.content', initial: 'onLoad' }],
      height: 600,
      width: 1000,
      zIndex: 95,
      resizable: true,
      focusAuto: false,
      svelte: {
        class: OverlayEditorUI,
        target: document.body,
      },
    });
  }
  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();

    buttons.unshift(
      {
        icon: "fas fa-file-import",
        title: localize("obs-utils.applications.overlayEditor.importButton"),
        label: localize("obs-utils.applications.overlayEditor.importButton"),

        onPress: async function () {
          new Dialog(
            {
              title: localize(
                "obs-utils.applications.overlayEditor.importDialog.title",
              ),
              content: await renderTemplate("templates/apps/import-data.html", {
                hint1: localize(
                  "obs-utils.applications.overlayEditor.importDialog.hint1",
                ),
                hint2: localize(
                  "obs-utils.applications.overlayEditor.importDialog.hint2",
                ),
              }),
              buttons: {
                replace: {
                  icon: '<i class="fas fa-file-import"></i>',
                  label: localize(
                    "obs-utils.applications.overlayEditor.importDialog.replaceButton",
                  ),
                  callback: (html) => {
                    const form = html.find("form")[0];
                    if (!form.data.files.length)
                      return ui.notifications.error(
                        localize(
                          "obs-utils.applications.overlayEditor.importDialog.fileError",
                        ),
                      );
                    readTextFromFile(form.data.files[0]).then((json) =>
                      importChatCommands(json, false),
                    );
                  },
                },
                append: {
                  icon: '<i class="fas fa-file-import"></i>',
                  label: localize(
                    "obs-utils.applications.overlayEditor.importDialog.appendButton",
                  ),
                  callback: (html) => {
                    const form = html.find("form")[0];
                    if (!form.data.files.length)
                      return ui.notifications.error(
                        localize(
                          "obs-utils.applications.overlayEditor.importDialog.fileError",
                        ),
                      );
                    readTextFromFile(form.data.files[0]).then((json) =>
                      importChatCommands(json, true),
                    );
                  },
                },
                no: {
                  icon: '<i class="fas fa-times"></i>',
                  label: localize(
                    "obs-utils.applications.overlayEditor.importDialog.cancelButton",
                  ),
                },
              },
              default: "import",
            },
            {
              width: 400,
            },
          ).render(true);
        },
      },
      {
        icon: "fas fa-file-export",
        title: localize("obs-utils.applications.overlayEditor.exportButton"),
        label: localize("obs-utils.applications.overlayEditor.exportButton"),

        onPress: function () {
          new Dialog({
            title: localize(
              "obs-utils.applications.overlayEditor.exportDialog.title",
            ),
            content: localize(
              "obs-utils.applications.overlayEditor.exportDialog.content",
            ),
            buttons: {
              yes: {
                label: localize(
                  "obs-utils.applications.overlayEditor.exportDialog.yesButton",
                ),
                callback: () => exportChatCommands(),
              },
              no: {
                label: localize(
                  "obs-utils.applications.overlayEditor.exportDialog.noButton",
                ),
              },
            },
          }).render(true);
        },
      },
    );

    return buttons;
  }
}

function exportChatCommands() {
  const overlays = foundry.utils.deepClone(getSetting("streamOverlays"));

  let data = {
    type: "ObsUtilsOverlays",
    version: 1,
    overlays: overlays,
    system: game.system?.id,
  };

  const filename = [
    "obsu",
    game.system?.id,
    game.world.id,
    "overlays",
    new Date().toString(),
  ].filterJoin("-");
  saveDataToFile(
    JSON.stringify(data, null, 2),
    "text/json",
    `${filename}.json`,
  );
}

/**
 * @param {String} data
 * @param {boolean} join
 */
async function importChatCommands(data, join) {
  /**
   * @type {{version:number, type: String,system: String, overlays:[]}}
   */
  const imported = JSON.parse(data);
  if (imported.type !== "ObsUtilsOverlays") {
    throw new Error(
      localize("obs-utils.applications.overlayEditor.importDialog.formatError"),
    );
  }
  if (imported.version !== 1) {
    throw new Error(
      localize(
        "obs-utils.applications.overlayEditor.importDialog.versionError",
      ),
    );
  }
  if (join) {
    const overlays = getSetting("streamOverlays");
    overlays.push(...imported.overlays);
    await setSetting("streamOverlays", overlays);
  } else {
    await setSetting("streamOverlays", imported.overlays);
  }
}
