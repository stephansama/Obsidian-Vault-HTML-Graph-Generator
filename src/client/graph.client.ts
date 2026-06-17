declare const d3: typeof import("d3");

type ClientNode = {
	id: string;
	label: string;
	link_count: number;
	color: string;
	x?: number;
	y?: number;
	vx?: number;
	vy?: number;
	fx?: number | null;
	fy?: number | null;
};

type ClientEdge = {
	source: string | ClientNode;
	target: string | ClientNode;
};

type ClientColorGroup = {
	query: string;
	color: string;
};

type Payload = {
	nodes: ClientNode[];
	edges: ClientEdge[];
	colorGroups: ClientColorGroup[];
};

declare global {
	interface Window {
		bootGraph: (payload: Payload) => void;
	}
}

window.bootGraph = (payload: Payload) => {
	const { nodes, edges: links } = payload;

	const width = window.innerWidth;
	const height = window.innerHeight;

	const svg = d3
		.select<SVGSVGElement, unknown>("#graph")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	const g = svg.append("g");

	const zoom = d3.zoom<SVGSVGElement, unknown>()
		.scaleExtent([0.1, 4])
		.on("zoom", (event) => {
			g.attr("transform", event.transform);
		});

	svg.call(zoom);

	function customForce(alpha: number) {
		const centerX = width / 2;
		const centerY = height / 2;
		const strength = 0.05;
		for (const node of nodes) {
			node.vx = (node.vx ?? 0) + (centerX - (node.x ?? 0)) * strength * alpha;
			node.vy = (node.vy ?? 0) + (centerY - (node.y ?? 0)) * strength * alpha;
		}
	}

	function labelCollision() {
		const alpha = 0.5;
		const minDistance = 20;
		return () => {
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const a = nodes[i];
					const b = nodes[j];
					const ax = a.x ?? 0;
					const ay = a.y ?? 0;
					const bx = b.x ?? 0;
					const by = b.y ?? 0;
					const dx = ax - bx;
					const dy = ay - by;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance > 0 && distance < minDistance) {
						const moveFactor = ((minDistance - distance) / distance) * alpha;
						const mx = dx * moveFactor;
						const my = dy * moveFactor;
						a.x = ax + mx;
						a.y = ay + my;
						b.x = bx - mx;
						b.y = by - my;
					}
				}
			}
		};
	}

	const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
		.force(
			"link",
			d3.forceLink(links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
				.id((d) => (d as ClientNode).id)
				.distance((d) => {
					const srcId = ((d as ClientEdge).source as ClientNode).id;
					const dstId = ((d as ClientEdge).target as ClientNode).id;
					const sourceLinks = links.filter((link) => {
						const s = (link.source as ClientNode).id;
						const t = (link.target as ClientNode).id;
						return s === srcId || t === srcId;
					}).length;
					const targetLinks = links.filter((link) => {
						const s = (link.source as ClientNode).id;
						const t = (link.target as ClientNode).id;
						return s === dstId || t === dstId;
					}).length;
					return Math.min(150, Math.max(50, (sourceLinks + targetLinks) * 10));
				}),
		)
		.force("charge", d3.forceManyBody().strength(-300))
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force("custom", customForce)
		.force("collision", labelCollision())
		.alphaDecay(0.02)
		.alphaMin(0.001)
		.on("tick", ticked);

	const link = g
		.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(links)
		.enter()
		.append("line")
		.attr("class", "link");

	const node = g
		.append("g")
		.attr("class", "nodes")
		.selectAll<SVGCircleElement, ClientNode>("circle")
		.data(nodes)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", (d) => 5 + Math.sqrt(d.link_count))
		.attr("fill", (d) => d.color)
		.call(
			d3.drag<SVGCircleElement, ClientNode>()
				.on("start", (event, d) => {
					if (!event.active) simulation.alphaTarget(0.3).restart();
					d.fx = d.x ?? 0;
					d.fy = d.y ?? 0;
				})
				.on("drag", (event, d) => {
					d.fx = event.x;
					d.fy = event.y;
				})
				.on("end", (event, d) => {
					if (!event.active) simulation.alphaTarget(0);
					d.fx = null;
					d.fy = null;
				}),
		);

	const text = g
		.append("g")
		.attr("class", "texts")
		.selectAll("text")
		.data(nodes)
		.enter()
		.append("text")
		.attr("x", 8)
		.attr("y", ".31em")
		.text((d) => d.label);

	function ticked() {
		link
			.attr("x1", (d) => ((d as ClientEdge).source as ClientNode).x ?? 0)
			.attr("y1", (d) => ((d as ClientEdge).source as ClientNode).y ?? 0)
			.attr("x2", (d) => ((d as ClientEdge).target as ClientNode).x ?? 0)
			.attr("y2", (d) => ((d as ClientEdge).target as ClientNode).y ?? 0);

		node
			.attr("cx", (d) => d.x ?? 0)
			.attr("cy", (d) => d.y ?? 0);

		text
			.attr("x", (d) => (d.x ?? 0) + 8)
			.attr("y", (d) => (d.y ?? 0) + 3);
	}
};

export {};
