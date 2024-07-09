function addAllNodesToGraph() {
    let x = 50; // Starting x position
    let y = 50; // Starting y position
    let deltaX = 250; // Y increment for each node

    for (let key in LiteGraph.registered_node_types) {
        try {
            console.log(key);
            const constantNode = LiteGraph.createNode(key);
            constantNode.pos = [x, y];
            graph.add(constantNode);
            
            x += deltaX; // Increment y position for next node
            if (x > window.innerWidth + 300) {
                x = 50;
                y += 150; // Move to the next column
            }
        } catch {
            console.error(`can't load ${key}`);
        }
        continue;
        let node = LiteGraph.createNode(key);
        node.pos = [x, y]; // Set position
        LiteGraph.createNode(node); // Add node to the graph

        // Optional: wrap around and reset y position after a certain number of nodes
        if (y > window.innerHeight - 100) {
            y = 50;
            x += 200; // Move to the next column
        }
    }

}

// Usage
addAllNodesToGraph();

