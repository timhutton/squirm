// SquirmCreature.java

import java.applet.*;
import java.awt.*;
import java.util.*;

public class SquirmCreature {
	
	protected int strategy; // takes one of the below values
	public static final int FROZEN=-1;
	public static final int RANDOM=0;
	public static final int DOWN=1;
	public static final int UP=2;
	public static final int LEFT=3;
	public static final int RIGHT=4;
	
	protected final Color colour;
	
	protected Vector cells;
	
	public SquirmCreature(int x,int y,int size_x,int size_y,int strat,
		Vector cell_list,SquirmCellSlot cell_grid[][])
	{
		// initialize some cells
		cells = new Vector();
		int i,j;
		for(i=0;i<size_x;i++)
			for(j=0;j<size_y;j++)
			cells.addElement(new SquirmCell(this,x+i,y+j,cell_list,cell_grid));
		
		// initialize our colour
		colour = new Color((float)Math.random(),(float)Math.random(),(float)Math.random());
		
		// initialize our strategy
		strategy=strat;
	}
	
	/** returns the square we want the cell to move to */
	public int getMoveOpinion(SquirmCell asker,int choice[],int n_choices,boolean valid_move[])
	{
		switch(strategy)
		{
		case FROZEN: return 8;
		case RANDOM: return choice[(int)Math.floor(Math.random()*(float)n_choices)];
		case LEFT: {
						if(valid_move[0]) return 0;
						else if(valid_move[7]&&valid_move[1]) return Math.random()<0.5?7:1;
						else if(valid_move[1]) return 1;
						else if(valid_move[7]) return 7;
						else if(valid_move[2]&&valid_move[6]) return Math.random()<0.5?2:6;
						else if(valid_move[2]) return 2;
						else if(valid_move[6]) return 6;
						else if(valid_move[3]&&valid_move[5]) return Math.random()<0.5?3:5;
						else if(valid_move[3]) return 3;
						else if(valid_move[5]) return 5;
						else if(valid_move[4]) return 4;
						else return 8;
				   }
		case RIGHT: {
						if(valid_move[4]) return 4;
						else if(valid_move[3]&&valid_move[5]) return Math.random()<0.5?3:5;
						else if(valid_move[3]) return 3;
						else if(valid_move[5]) return 5;
						else if(valid_move[2]&&valid_move[6]) return Math.random()<0.5?2:6;
						else if(valid_move[2]) return 2;
						else if(valid_move[6]) return 6;
						else if(valid_move[1]&&valid_move[7]) return Math.random()<0.5?1:7;
						else if(valid_move[1]) return 1;
						else if(valid_move[7]) return 7;
						else if(valid_move[0]) return 0;
						else return 8;
				   }
		case DOWN: {
						if(valid_move[6]) return 6;
						else if(valid_move[7]&&valid_move[5]) return Math.random()<0.5?7:5;
						else if(valid_move[7]) return 7;
						else if(valid_move[5]) return 5;
						else if(valid_move[0]&&valid_move[4]) return Math.random()<0.5?0:4;
						else if(valid_move[0]) return 0;
						else if(valid_move[4]) return 4;
						else if(valid_move[1]&&valid_move[3]) return Math.random()<0.5?1:3;
						else if(valid_move[1]) return 1;
						else if(valid_move[3]) return 3;
						else if(valid_move[2]) return 2;
						else return 8;
				   }
		case UP: {
						if(valid_move[2]) return 2;
						else if(valid_move[1]&&valid_move[3]) return Math.random()<0.5?1:3;
						else if(valid_move[1]) return 1;
						else if(valid_move[3]) return 3;
						else if(valid_move[0]&&valid_move[4]) return Math.random()<0.5?0:4;
						else if(valid_move[0]) return 0;
						else if(valid_move[4]) return 4;
						else if(valid_move[7]&&valid_move[5]) return Math.random()<0.5?7:5;
						else if(valid_move[7]) return 7;
						else if(valid_move[5]) return 5;
						else if(valid_move[6]) return 6;
						else return 8;
				   }
		default: break;
		}
		// ASSERT(false); // how to assert in java?
		return 8; // shouldn't get here
	}

	private float sqr(float x) { return x*x; }
};