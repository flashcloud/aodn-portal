
/*
 * Copyright 2012 IMOS
 *
 * The AODN/IMOS Portal is distributed under the terms of the GNU General Public License
 *
 */

package au.org.emii.portal

class SnapshotLayer {
    
    static belongsTo = [snapshot: Snapshot]
    
    // Configured layer
    Layer layer
    
    // Animation details
    Boolean animated = false
    String chosenTimes

    // Layer added from search     
    String serviceUrl
    String name
    String title
    
    Boolean isBaseLayer = false
    Boolean hidden = false
    Float opacity
    String styles = ""
    String cql

    static constraints = {
        layer(nullable: true)
        serviceUrl(url: true, nullable: true, validator: { val, obj -> 
            obj.layer == null && val == null ? 'nullable' : true
        })
        name(blank: false, nullable: true, validator: { val, obj ->
            obj.layer == null && val == null ? 'nullable' : true
        })
        title(blank: false, nullable: true, validator: { val, obj ->
            obj.layer == null && val == null ? 'nullable' : true
        })
        isBaseLayer()
        hidden()
        animated()
        chosenTimes(nullable:true)
        opacity(nullable:true)
        styles()
        cql(nullable: true)

    }
}
