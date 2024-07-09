function addAllNodesToGraph() {
    let x = 50; // Starting x position
    let y = 50; // Starting y position
    let deltaY = 150; // Y increment for each node

    for (let key in LiteGraph.registered_node_types) {
        console.log(key);
        const constantNode = LiteGraph.createNode(key);
        constantNode.pos = [x, y];
        graph.add(constantNode);
        
        y += deltaY; // Increment y position for next node
        if (y > window.innerHeight - 50) {
            y = 50;
            x += 250; // Move to the next column
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

