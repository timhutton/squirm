// SquirmGrid.java

import java.applet.*;
import java.awt.*;
import java.util.*;

import SquirmCellSlot;
import SquirmCreature;

/**
 
   The SquirmGrid class manages a 2D grid of SquirmCellSlots and a list of SquirmCells. By storing
   both structures we make great speed savings at the expense of using extra memory.

  Can query for a cell slot being empty using cell_grid[x][y].queryEmpty()

  If a cell slot is empty can retrieve its cell using cell_grid[x][y].getOccupant()

  Can retrieve a specific cell using ((SquirmCell)cell_list.elementAt(i))

  */

public class SquirmGrid {

	/** array of SquirmCellSlots that may or may not have SquirmCells in */
	protected SquirmCellSlot cell_grid[][];

	/** the x and y size of the cell_grid array */
	protected int n_x,n_y;

	/** list of the SquirmCells that exist in the grid */
	protected Vector cell_list;

	/** public constructor initializes size of grid and creates a simple world */
	public SquirmGrid(int x,int y)
	{
		n_x = x;
		n_y = y;

		// initialize the 2D grid of slots
		cell_grid = new SquirmCellSlot[n_x][n_y];
		int i,j;
		for(i=0;i<n_x;i++) for(j=0;j<n_y;j++) cell_grid[i][j] = new SquirmCellSlot();
		
		cell_list = new Vector();

		initSimple();
	}

	/** straightforward drawing of the grid and its contents */
	public void draw(Graphics g,float scale)
	{
		// ask all the cells to draw themselves
		for(Enumeration e = cell_list.elements();e.hasMoreElements();)	
	        ((SquirmCell)e.nextElement()).draw(g,scale);
	}

	/** initialize some simple creatures */
	public void initSimple()
	{
		// initialize the world with some simple creatures
		new SquirmCreature(50,80,10,10,SquirmCreature.UP,cell_list,cell_grid);
		new SquirmCreature(50,20,10,10,SquirmCreature.DOWN,cell_list,cell_grid);
		new SquirmCreature(80,30,20,20,SquirmCreature.RANDOM,cell_list,cell_grid);
		new SquirmCreature(20,130,10,10,SquirmCreature.RIGHT,cell_list,cell_grid);
		new SquirmCreature(80,130,10,10,SquirmCreature.LEFT,cell_list,cell_grid);
		new SquirmCreature(90,10,3,3,SquirmCreature.DOWN,cell_list,cell_grid);
		//new SquirmCreature(10,160,180,10,SquirmCreature.UP,cell_list,cell_grid);
	}

	/** simulation give each cell a chance to move, in strict order */
	public void doTimeStep()
	{
		// ask all the cells to move as they wish
		for(Enumeration e = cell_list.elements();e.hasMoreElements();)	
	        ((SquirmCell)e.nextElement()).doTimeStep(n_x,n_y,cell_list,cell_grid);
	}
	
};