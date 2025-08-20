import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"

import { Menu } from "./Menu"
import { SubMenu } from "./SubMenu"
import { MenuItem } from "./MenuItem"
import { Divider } from "./Divider"
import { httpJupyter } from "@http/axios"
import endpoint from "@http/endpoint"

declare global {
  interface Window {
    __lastDPress?: number
  }
}

const profileServer = [
  {
    key: "data-eng",
    image: "qdsparq/jupyter-pyspark-delta",
    cpu: 2,
    memory: "8G",
    description: "Data Engineering (CPU)",
  },
  {
    key: "small-notebook",
    image: "qdsparq/jupyter-pyspark-delta",
    cpu: 1,
    memory: "2G",
    description: "Small Notebook (Test)",
  },
  {
    key: "memory-opt",
    image: "qdsparq/jupyter-pyspark-delta",
    cpu: 2,
    memory: "16G",
    description: "Memory Optimized Notebook",
  },
]

const WorkspaceToolbar = () => {
  const {
    activeTabId,
    activeCellId,
    handleNewTab,
    handleInsertAbove,
    handleInsertBelow,
    handleDeleteCell,
    handleMoveCell,
    handleRunAllCells,
    handleRunAllAbove,
    handleRunAllBelow,
    handleClearAllCellOutputs,
    saveFile,
    renameActiveTab,
    importNotebook,

    restartKernel,
    shutdownKernel,
    interruptKernel,
    restartAndRunAllCells,
    setKernelActive,
  } = useCreateWorkspace()

  const runningServer = async (name: string) => {
    try {
      const response = await httpJupyter.post(endpoint.jupyter.start_server, {
        profileId: name,
      })

      if (response.data) {
        setKernelActive({
          id: response.data.id,
          name: name,
          last_activity: response.data.last_activity,
          execution_state: response.data.execution_state,
          connections: response.data.connections,
        })
      }
    } catch (error) {
      console.error("Error fetching server status:", error)
    }
  }

  return (
    <div className="flex items-center gap-2 py-1 rounded-t-2xl bg-white z-[9999] w-full">
      <Menu label="File">
        <SubMenu label="New">
          <MenuItem
            label="Python File"
            onClick={() => handleNewTab({ type: "code" })}
          />
          <MenuItem
            label="Markdown File"
            onClick={() => handleNewTab({ type: "markdown" })}
          />
          <MenuItem
            label="SQL File"
            onClick={() => handleNewTab({ type: "sql" })}
          />
        </SubMenu>

        {/* <SubMenu label="New Text Notebook">
          <MenuItem
            label="Python 3"
            onClick={() => alert("New Python 3 Notebook")}
          />
          <MenuItem label="R" onClick={() => alert("New R Notebook")} />
        </SubMenu>

        <SubMenu label="Jupytext">
          <MenuItem
            label="Notebook to Script"
            onClick={() => alert("Convert to Script")}
          />
          <MenuItem
            label="Script to Notebook"
            onClick={() => alert("Convert to Notebook")}
          />
        </SubMenu>

        <MenuItem
          label="New Launcher"
          shortcut="⇧ ⌘ L"
          onClick={() => alert("New Launcher")}
        /> */}
        <MenuItem label="Import Notebook..." onClick={importNotebook} />
        <Divider />

        {/* <MenuItem
          label="Open from URL..."
          onClick={() => alert("Open from URL")}
        />
        <SubMenu label="Open Recent">
          <MenuItem
            label="notebook1.ipynb"
            onClick={() => alert("Open notebook1")}
          />
          <MenuItem
            label="notebook2.ipynb"
            onClick={() => alert("Open notebook2")}
          />
        </SubMenu> */}

        {/* <Divider /> */}
        {/* <MenuItem label="New View for" disabled />
        <MenuItem label="New Console for Activity" disabled />
        <Divider />

        <MenuItem
          label="Close Tab"
          shortcut="⌥ W"
          onClick={() => alert("Close Tab")}
        />
        <MenuItem
          label="Close and Shut Down"
          shortcut="⌃⇧ Q"
          onClick={() => alert("Close and Shut Down")}
        />
        <MenuItem
          label="Close All Tabs"
          onClick={() => alert("Close All Tabs")}
        /> */}
        {/* <Divider /> */}

        <MenuItem label="Save" shortcut="⌘ S" onClick={saveFile} />
        <MenuItem label="Save As..." shortcut="⇧⌘ S" disabled />
        <MenuItem label="Save All" disabled />
        <Divider />
        {/* <MenuItem label="Reload from Disk" disabled />
        <MenuItem label="Revert to Checkpoint..." disabled /> */}
        <MenuItem
          label="Rename..."
          onClick={renameActiveTab}
          disabled={!activeTabId}
        />
        <MenuItem label="Clone" disabled />
        <MenuItem label="Move" disabled />
        <MenuItem label="Move to Trash" disabled />
        <Divider />
        <SubMenu label="Export">
          <MenuItem label="HTML" onClick={() => alert("Export as HTML")} />
          <MenuItem label="PDF" onClick={() => alert("Export as PDF")} />
        </SubMenu>
        <Divider />
        {/* <MenuItem
          label="Print..."
          shortcut="⌘ P"
          onClick={() => alert("Print")}
        />
        <Divider /> */}
        <MenuItem label="Hub Control Panel" />
        <MenuItem label="Log Out" />
      </Menu>

      <Menu label="Edit">
        {/* <MenuItem label="Undo" shortcut="⌘ Z" />
        <MenuItem label="Redo" shortcut="⇧ ⌘ Z" />
        <Divider />

        <MenuItem label="Undo Cell Operation" shortcut="Z" />
        <MenuItem label="Redo Cell Operation" shortcut="⇧ Z" />
        <Divider /> */}

        <MenuItem label="Cut Cell" shortcut="X" />
        <MenuItem label="Copy Cell" shortcut="C" />
        <MenuItem label="Paste Cell Below" shortcut="V" />
        <MenuItem label="Paste Cell Above" />
        <MenuItem label="Paste Cell and Replace" />
        <Divider />
        <MenuItem
          label="Insert Cell Below"
          shortcut="⌃ ⇧ ↑"
          onClick={() => handleInsertAbove(activeTabId, activeCellId)}
        />
        <MenuItem
          label="Insert Cell Above"
          shortcut="⌃ ⇧ ↑"
          onClick={() => handleInsertBelow(activeTabId, activeCellId)}
        />

        <Divider />
        <MenuItem
          label="Delete Cell"
          shortcut="D, D"
          onClick={() => handleDeleteCell(activeTabId, activeCellId)}
        />
        <MenuItem label="Select All Cells" shortcut="⌘ A" />
        <MenuItem label="Deselect All Cells" />
        <Divider />

        <MenuItem
          label="Move Cell Up"
          shortcut="⌃ ⇧ ↑"
          onClick={() => handleMoveCell(activeTabId, activeCellId, "up")}
        />

        <MenuItem
          label="Move Cell Down"
          shortcut="⌃ ⇧ ↓"
          onClick={() => handleMoveCell(activeTabId, activeCellId, "down")}
        />
        <Divider />

        {/* <MenuItem label="Split Cell" shortcut="⌃ ⇧ -" />
        <MenuItem label="Merge Selected Cells" shortcut="⇧ M" />
        <MenuItem label="Merge Cell Above" shortcut="⌃ ⌘ ↑" />
        <MenuItem label="Merge Cell Below" shortcut="⌃ ⇧ M" />
        <Divider /> */}
        <MenuItem label="Format Cell" />
        <MenuItem label="Clear" />
        <MenuItem label="Clear All" />
        <Divider />

        <MenuItem label="Find…" shortcut="⌘ F" />
        {/* <MenuItem label="Find Next" shortcut="⌘ G" />
        <MenuItem label="Find Previous" shortcut="⇧ ⌘ G" /> */}
        {/* <Divider />

        <MenuItem label="Go to Line…" /> */}
      </Menu>

      <Menu label="View">
        {/* <MenuItem
          label="Activate Command Palette"
          shortcut="⇧ ⌘ C"
          onClick={() => alert("Activate Command Palette")}
        />
        <Divider /> */}

        <SubMenu label="Appearance">
          {/* <MenuItem
            label="Simple Interface"
            shortcut="⇧⌘D"
            onClick={() => alert("Toggled Simple Interface")}
          />
          <MenuItem
            label="Presentation Mode"
            onClick={() => alert("Toggled Presentation Mode")}
          />
          <MenuItem
            label="Fullscreen Mode"
            shortcut="F11"
            onClick={() => alert("Toggled Fullscreen")}
          />
          <Divider /> */}
          <MenuItem
            label="Show Left Sidebar"
            shortcut="⌘B"
            checked
            onClick={() => alert("Toggled Left Sidebar")}
          />
          <MenuItem
            label="Show Left Activity Bar"
            checked
            onClick={() => alert("Toggled Left Activity Bar")}
          />
          <MenuItem
            label="Show Right Sidebar"
            shortcut="⌘J"
            onClick={() => alert("Toggled Right Sidebar")}
          />
          <MenuItem
            label="Show Status Bar"
            checked
            onClick={() => alert("Toggled Status Bar")}
          />
          <Divider />
          <MenuItem
            label="Reset Default Layout"
            onClick={() => alert("Layout Reset")}
          />
        </SubMenu>

        <Divider />

        {/* <MenuItem
          label="File Browser"
          shortcut="⇧ ⌘ F"
          onClick={() => alert("File Browser")}
        />
        <MenuItem
          label="Property Inspector"
          shortcut="⇧ ⌘ U"
          onClick={() => alert("Property Inspector")}
        />
        <MenuItem
          label="Sessions and Tabs"
          shortcut="⇧ ⌘ B"
          onClick={() => alert("Sessions and Tabs")}
        />
        <MenuItem
          label="Table of Contents"
          shortcut="⇧ ⌘ K"
          onClick={() => alert("Table of Contents")}
        />
        <Divider />

        <MenuItem
          label="Show Notifications"
          onClick={() => alert("Show Notifications")}
        />
        <MenuItem
          label="Show Log Console"
          onClick={() => alert("Show Log Console")}
        />
        <Divider />

        <MenuItem label="Show Line Numbers" shortcut="⇧ L" disabled />
        <MenuItem label="Match Brackets" disabled />
        <MenuItem label="Wrap Words" disabled />
        <MenuItem label="Open in Jupyter Notebook" disabled />
        <Divider />

        <MenuItem label="Collapse Selected Code" disabled />
        <MenuItem label="Collapse Selected Outputs" disabled />
        <MenuItem label="Collapse All Code" disabled />
        <MenuItem label="Collapse All Outputs" disabled />
        <Divider />

        <MenuItem label="Expand Selected Code" disabled />
        <MenuItem label="Expand Selected Outputs" disabled />
        <MenuItem label="Expand All Code" disabled />
        <MenuItem label="Expand All Outputs" disabled />
        <Divider />

        <MenuItem
          label="Render Side-by-Side"
          shortcut="⇧ R"
          onClick={() => alert("Render Side-by-Side")}
        />
        <Divider />

        <SubMenu label="Text Editor Syntax Highlighting">
          <MenuItem label="Python" onClick={() => alert("Syntax: Python")} />
          <MenuItem
            label="JavaScript"
            onClick={() => alert("Syntax: JavaScript")}
          />
          <MenuItem label="JSON" onClick={() => alert("Syntax: JSON")} />
          <MenuItem
            label="Markdown"
            onClick={() => alert("Syntax: Markdown")}
          />
          <MenuItem label="YAML" onClick={() => alert("Syntax: YAML")} />
          <MenuItem label="None" onClick={() => alert("Syntax: None")} />
        </SubMenu> */}
      </Menu>

      <Menu label="Run">
        <SubMenu label="Run & Debug">
          <MenuItem
            label="Run All Cell"
            shortcut="⌃⏎"
            onClick={() => handleRunAllCells(activeTabId)}
          />
          <MenuItem
            label="Run Selected Cell"
            shortcut="⇧⏎"
            onClick={() => alert("Run Selected Cell")}
          />
          <MenuItem
            label="Run All Above"
            shortcut="⌃⏎"
            onClick={() => handleRunAllAbove(activeTabId, activeCellId)}
          />
          <MenuItem
            label="Run All Below"
            shortcut="⌘⏎"
            onClick={() => handleRunAllBelow(activeTabId, activeCellId)}
          />
          <MenuItem
            label="Run Selected Text"
            onClick={() => alert("Run Selected Text")}
          />
        </SubMenu>
        <SubMenu label="Clear">
          <MenuItem
            label="Clear All Cell Ouputs"
            shortcut="⌘⏎"
            onClick={() => handleClearAllCellOutputs(activeTabId)}
          />
          <MenuItem
            label="Clear Selected Cell Output"
            shortcut="⌘⏎"
            onClick={() => alert("Clear Selected Cell Output")}
          />
        </SubMenu>
        {/* <Divider />

        <MenuItem
          label="Run All Above Selected Cell"
          onClick={() => alert("Run All Above Selected Cell")}
        />
        <MenuItem
          label="Run Selected Cell and All Below"
          onClick={() => alert("Run Selected Cell and All Below")}
        />
        <Divider />

        <MenuItem
          label="Render All Markdown Cells"
          onClick={() => alert("Render All Markdown Cells")}
        />
        <Divider />

        <MenuItem label="Run All" onClick={() => alert("Run All")} />
        <MenuItem
          label="Restart Kernel and Run All"
          onClick={() => alert("Restart Kernel and Run All")}
        /> */}
      </Menu>

      <Menu label="Kernel">
        <MenuItem label="Restart Kernel" onClick={restartKernel} />
        <SubMenu label="Change Kernel">
          {profileServer.map((profile) => (
            <MenuItem
              key={profile.key}
              label={`${profile.key} (${profile.cpu} CPU, ${profile.memory})`}
              onClick={() => runningServer(profile.key)}
            />
          ))}
        </SubMenu>
        <MenuItem label="Shutdown Kernel" onClick={shutdownKernel} />
        <MenuItem
          label="Restart & Run All Cells"
          onClick={restartAndRunAllCells}
        />
        <Divider />
        <MenuItem label="Interrupt Kernel" onClick={interruptKernel} />
      </Menu>

      {/* <Menu label="Tabs">
        <MenuItem
          label="Show Previous Tab"
          shortcut="⌃⇧ Tab"
          onClick={() => alert("Show Previous Tab")}
        />
        <MenuItem
          label="Show Next Tab"
          shortcut="⌃ Tab"
          onClick={() => alert("Show Next Tab")}
        />
        <Divider />
        <MenuItem label="Close Tab" onClick={() => alert("Close Tab")} />
        <MenuItem
          label="Close Other Tabs"
          onClick={() => alert("Close Other Tabs")}
        />
        <MenuItem
          label="Close Tabs to the Right"
          onClick={() => alert("Close Tabs to the Right")}
        />
      </Menu> */}

      <Menu label="Settings">
        <MenuItem
          label="Settings Editor"
          onClick={() => alert("Open Settings Editor")}
        />
        <MenuItem
          label="Save Widget State Automatically"
          onClick={() => alert("Save Widget State Automatically")}
        />
        {/* <Divider />
        <MenuItem
          label="Enable/Disable Extensions..."
          onClick={() => alert("Manage Extensions")}
        /> */}
      </Menu>

      <Menu label="Help">
        {/* <MenuItem
          label="Documentation"
          onClick={() => alert("Open Documentation")}
        />
        <MenuItem
          label="Release Notes"
          onClick={() => alert("Open Release Notes")}
        /> */}
        <MenuItem label="About " onClick={() => alert("Open About")} />
        <MenuItem
          label="Keyboard Shortcuts"
          onClick={() => alert("Open Keyboard Shortcuts")}
        />
      </Menu>
    </div>
  )
}

export default WorkspaceToolbar
