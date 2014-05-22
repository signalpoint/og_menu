
/**
 * Implements hook_block_info().
 */
function og_menu_block_info() {
  var blocks = {
    og_single_menu_block: {
      delta: 'og_single_menu_block',
      module: 'og_menu'
    }
  };
  return blocks;
}

/**
 * Implements hook_block_view().
 */
function og_menu_block_view(delta) {
  try {
    var content = '';

    if (delta == 'og_single_menu_block') {
      
      // This menu is only (potentially) shown on node pages.
      if (arg(0) != 'node' || !is_int(arg(1)) || arg(2) == 'edit') { return content; }
      
      // This menu needs to by dynamically fetched from the Drupal site, so
      // let's set up a pageshow handler to fetch it.
      content = '<div id="' + og_menu_container_id()  + '"></div>' +
        drupalgap_jqm_page_event_script_code({
            page_id: drupalgap_get_page_id(),
            jqm_page_event: 'pageshow',
            jqm_page_event_callback: 'og_menu_block_view_pageshow',
            jqm_page_event_args: JSON.stringify({
                nid: arg(1)
            })
        });
    }

    return content;
  }
  catch (error) { console.log('og_menu_block_view - ' + error); }
}

function og_menu_block_view_pageshow(options) {
  node_load(options.nid, {
      success: function(node) {
        // If there is no group attached the node, the don't do anything.
        if (typeof node.og_group_ref === 'undefined') { return; }
        var group_id = node.og_group_ref[node.language][0]['target_id'];
        menu_load('menu-og-' + group_id, {
            success: function(menu) {
              var items = services_menu_tree(menu);
              if (!items) { return; }
              var links = [];
              $.each(items, function(index, item) {
                  links.push(l(item.title, item.path));
              });
              if (links.length == 0) { return; }
              var item_list = theme('jqm_item_list', { items: links });
              $('#' + og_menu_container_id()).html(item_list).trigger('create');
            }
        });
      }
  });
}

/**
 *
 */
function og_menu_container_id() {
  try {
    return 'og_menu_' + drupalgap_get_page_id();
  }
  catch (error) { console.log('og_menu_container_id - ' + error); }
}

