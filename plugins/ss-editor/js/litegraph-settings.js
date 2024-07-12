
import { LiteGraph } from "/litegraph/src/litegraph.js";

// LiteGraph.debug_level = 4; // -1 to disable all, now shows up to index of console['error','warning','info','log','debug']
LiteGraph.logging_set_level(4); // -1 to disable all, 4 is all on

LiteGraph.catch_exceptions = true;
LiteGraph.throw_errors = true;
LiteGraph.allow_scripts = false; //if set to true some nodes like Formula would be allowed to evaluate code that comes from unsafe sources (like node configuration); which could lead to exploits

LiteGraph.searchbox_extras = {}; //used to add extra features to the search box
LiteGraph.auto_sort_node_types = true; // [true!] If set to true; will automatically sort node types / categories in the context menus
LiteGraph.node_box_coloured_when_on = true; // [true!] this make the nodes box (top left circle) coloured when triggered (execute/action); visual feedback
LiteGraph.node_box_coloured_by_mode = true; // [true!] nodebox based on node mode; visual feedback
LiteGraph.dialog_close_on_mouse_leave = true; // [false on mobile] better true if not touch device;
LiteGraph.dialog_close_on_mouse_leave_delay = 500;
LiteGraph.shift_click_do_break_link_from = false; // [false!] prefer false if results too easy to break links
LiteGraph.click_do_break_link_to = false; // [false!]prefer false; way too easy to break links
LiteGraph.search_hide_on_mouse_leave = true; // [false on mobile] better true if not touch device;
LiteGraph.search_filter_enabled = true; // [true!] enable filtering slots type in the search widget; !requires auto_load_slot_types or manual set registered_slot_[in/out]_types and slot_types_[in/out]
LiteGraph.search_show_all_on_open = true; // [true!] opens the results list when opening the search widget
LiteGraph.show_node_tooltip = true; // [true!] show a tooltip with node property "tooltip" over the selected node
LiteGraph.show_node_tooltip_use_descr_property = true; // enabled tooltip from desc when property tooltip not set
LiteGraph.auto_load_slot_types = true; // [if want false; use true; run; get vars values to be statically set; than disable] nodes types and nodeclass association with node types need to be calculated; if dont want this; calculate once and set registered_slot_[in/out]_types and slot_types_[in/out]
/*// set these values if not using auto_load_slot_types
LiteGraph.registered_slot_in_types = {}; // slot types for nodeclass
LiteGraph.registered_slot_out_types = {}; // slot types for nodeclass
LiteGraph.slot_types_in = []; // slot types IN
LiteGraph.slot_types_out = []; // slot types OUT*/

LiteGraph.alt_drag_do_clone_nodes = true; // [true!] very handy; ALT click to clone and drag the new node
LiteGraph.do_add_triggers_slots = true; // [true!] will create and connect event slots when using action/events connections; !WILL CHANGE node mode when using onTrigger (enable mode colors); onExecuted does not need this
LiteGraph.allow_multi_output_for_events = false; // [false!] being events; it is strongly reccomended to use them sequentially; one by one
LiteGraph.middle_click_slot_add_default_node = true;  //[true!] allows to create and connect a ndoe clicking with the third button (wheel)
LiteGraph.release_link_on_empty_shows_menu = true; //[true!] dragging a link to empty space will open a menu, add from list, search or defaults
LiteGraph.pointerevents_method = "mouse"; // "mouse"|"pointer" use mouse for compatibility issues, touch will work only with pointer 
LiteGraph.ctrl_shift_v_paste_connect_unselected_outputs = true; //[true!] allows ctrl + shift + v to paste nodes with the outputs of the unselected nodes connected with the inputs of the newly pasted nodes
LiteGraph.backspace_delete = false;  // [false!] delete key is enough, don't mess with text edit and custom

LiteGraph.actionHistory_enabled = false; // [true!] cntrlZ, cntrlY
LiteGraph.actionHistoryMaxSave = 40;

LiteGraph.showCanvasOptions = true;// enable canvas options panel, customize in LiteGrpah.availableCanvasOptions

LiteGraph.use_uuids = true;

/* -- EVENTS PROCESSING METHODS -- */

/* METHOD 1 ANCESTORS : EXECUTING ACTIONS BEFORE THE NEXT FRAME, AFFECTING INPUT NODES WILL BE REPROCESSED */
LiteGraph.refreshAncestorsOnTriggers = false; //[true!]
LiteGraph.refreshAncestorsOnActions = false; //[true!]
LiteGraph.ensureUniqueExecutionAndActionCall = false; //[true!]

/* METHOD 2 DEFERRED ACTIONS */
LiteGraph.use_deferred_actions = true; //